import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { ImageResponse } from "$lib/index.js";
import { createSvg } from "$lib/helpers/create.js";

// local font so the satori path runs offline (no default_fonts fetch)
const fontData = readFileSync(
	new URL("./routes/(components)/SpaceMono-Regular.ttf", import.meta.url)
);
const fonts = [{ name: "Space Mono", data: fontData, weight: 400 as const, style: "normal" as const }];
const html = `<div style="display:flex;width:100%;height:100%">hi</div>`;

describe("satori ImageResponse", () => {
	it("createSvg returns an <svg> string", async () => {
		const svg = await createSvg(html, { width: 200, height: 100, fonts });
		expect(svg).toContain("<svg");
	});

	// regression: the svg body used to enqueue a raw string and throw on read
	it("svg body is readable bytes", async () => {
		const res = new ImageResponse(html, { format: "svg", width: 200, height: 100, fonts });
		expect(res.headers.get("Content-Type")).toBe("image/svg+xml");
		const text = await res.text();
		expect(text).toContain("<svg");
	});
});
