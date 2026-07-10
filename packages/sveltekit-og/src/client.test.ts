import { describe, it, expect } from "vitest";
import { ImageResponse, createImage } from "$lib/client/index.js";

// The client entry picks its wasm providers by runtime, so under vitest (node) it
// runs on the node providers — which lets us exercise the engine dispatch here.
const html = `<div style="display:flex;width:100%;height:100%;align-items:center;justify-content:center;background:white;font-size:48px;color:#203649">Hello</div>`;

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];
const png = (res: Response) =>
	res.arrayBuffer().then((b) => Array.from(new Uint8Array(b).subarray(0, 4)));

describe("client ImageResponse", () => {
	it("defaults to the takumi engine", async () => {
		const res = new ImageResponse(html, { width: 600, height: 300 });
		expect(res.headers.get("Content-Type")).toBe("image/png");
		expect(await png(res)).toEqual(PNG_MAGIC);
	});

	// Content-Type is computed in the constructor (no wasm until .blob()), so the
	// satori format clamp is checkable in node even though rendering is browser-only.
	it("labels satori raster formats as png (satori only emits png/svg)", () => {
		const res = new ImageResponse(html, {
			engine: "satori",
			format: "webp" as never,
			width: 600,
			height: 300,
		});
		expect(res.headers.get("Content-Type")).toBe("image/png");
	});

	it("keeps svg content-type for satori svg", () => {
		const res = new ImageResponse(html, { engine: "satori", format: "svg", width: 600, height: 300 });
		expect(res.headers.get("Content-Type")).toBe("image/svg+xml");
	});

	// The satori engine loads its wasm from bundler-emitted `?url` assets via
	// fetch(new URL(...)), which node's fetch can't read (file: scheme). It's
	// browser/worker-only — verify it through the /client route in a browser.
	it.skip("renders with the satori engine (browser-only)", async () => {
		const res = new ImageResponse(html, { engine: "satori", width: 600, height: 300 });
		expect(res.headers.get("Content-Type")).toBe("image/png");
		expect(await png(res)).toEqual(PNG_MAGIC);
	});

	it("passes response-only options through without leaking them into the engine", async () => {
		const res = new ImageResponse(html, {
			engine: "takumi",
			width: 600,
			height: 300,
			status: 201,
			statusText: "Created",
			headers: { "X-Custom": "1" },
		});
		expect(res.status).toBe(201);
		expect(res.headers.get("X-Custom")).toBe("1");
		expect(await png(res)).toEqual(PNG_MAGIC);
	});

	it("createImage function returns an equivalent Response", async () => {
		const res = createImage(html, { engine: "takumi", width: 600, height: 300 });
		expect(res).toBeInstanceOf(Response);
		expect(await png(res)).toEqual(PNG_MAGIC);
	});
});
