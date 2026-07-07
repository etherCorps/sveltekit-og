import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { ImageResponse } from "$lib/takumi/index.js";
import { createTakumiImage } from "$lib/takumi/render.js";
import { CustomFont } from "$lib/fonts.js";
import OG from "./routes/(components)/OG.svelte";

// Local font so these tests are hermetic. Takumi ships a built-in sans-serif, so
// rendering also works with no fonts at all — covered below.
const fontData = readFileSync(
	new URL("./routes/(components)/SpaceMono-Regular.ttf", import.meta.url)
);
const spaceMono = new CustomFont("Space Mono", fontData, { weight: 400 });

const html = `<div style="display:flex;width:100%;height:100%;align-items:center;justify-content:center;background:white;font-size:48px;color:#203649">Hello Takumi</div>`;

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];

describe("createTakumiImage (node/native)", () => {
	it("renders HTML to PNG bytes using the built-in font", async () => {
		const out = await createTakumiImage(html, { width: 600, height: 300, format: "png" });
		expect(out).toBeInstanceOf(Uint8Array);
		expect(Array.from((out as Uint8Array).subarray(0, 4))).toEqual(PNG_MAGIC);
	});

	it("renders WebP", async () => {
		const out = (await createTakumiImage(html, {
			width: 600,
			height: 300,
			format: "webp",
		})) as Uint8Array;
		// RIFF....WEBP container
		expect(Buffer.from(out.subarray(0, 4)).toString("ascii")).toBe("RIFF");
		expect(Buffer.from(out.subarray(8, 12)).toString("ascii")).toBe("WEBP");
	});

	it("renders SVG as a string", async () => {
		const out = await createTakumiImage(html, { width: 600, height: 300, format: "svg" });
		expect(typeof out).toBe("string");
		expect(out as string).toContain("<svg");
	});

	it("renders with a registered CustomFont", async () => {
		const out = await createTakumiImage(
			`<div style="display:flex;font-family:'Space Mono';font-size:40px">Fonts</div>`,
			{ width: 400, height: 200, format: "png", fonts: [spaceMono] }
		);
		expect(Array.from((out as Uint8Array).subarray(0, 4))).toEqual(PNG_MAGIC);
	});

	it("renders a Svelte component (props -> HTML -> image)", async () => {
		const out = await createTakumiImage(
			OG,
			{ width: 800, height: 400, format: "png" },
			{ text: "Hello", spanText: "Takumi" }
		);
		expect(Array.from((out as Uint8Array).subarray(0, 4))).toEqual(PNG_MAGIC);
	});

	// guards against the render input being dropped on the way to takumiRender
	// (a bug where the same output rendered regardless of the template).
	it("renders the given template, not a fixed placeholder", async () => {
		const base = { width: 600, height: 300, format: "png" } as const;
		const a = (await createTakumiImage(
			`<div style="display:flex;font-size:40px">First</div>`,
			base
		)) as Uint8Array;
		const b = (await createTakumiImage(
			`<div style="display:flex;font-size:40px">Second completely different</div>`,
			base
		)) as Uint8Array;
		expect(Buffer.from(a).equals(Buffer.from(b))).toBe(false);
	});
});

describe("Takumi ImageResponse", () => {
	it("sets png content-type and a readable body", async () => {
		const res = new ImageResponse(html, { width: 600, height: 300, format: "png" });
		expect(res.headers.get("Content-Type")).toBe("image/png");
		const buf = new Uint8Array(await res.arrayBuffer());
		expect(Array.from(buf.subarray(0, 4))).toEqual(PNG_MAGIC);
	});

	it("svg body is readable (bytes, not a raw string chunk)", async () => {
		const res = new ImageResponse(html, { width: 600, height: 300, format: "svg" });
		expect(res.headers.get("Content-Type")).toBe("image/svg+xml");
		const text = await res.text();
		expect(text).toContain("<svg");
	});
});
