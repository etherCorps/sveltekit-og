import { describe, it, expect, vi, beforeEach } from "vitest";
import { ImageResponse, createImage } from "$lib/client/index.js";
import { ErrorCodes } from "$lib/helpers/error-handler.js";
import Card from "./routes/client/Card.svelte";

// Vitest runs in node: no `document` (same as a worker), and the satori wasm
// can't be fetched from `?url` assets here. So these tests cover dispatch,
// the worker guard and the font fallback; real satori rendering is checked by
// hand in the browser (see the spec's manual checklist).
const html = `<div style="display:flex;width:100%;height:100%;align-items:center;justify-content:center;background:white;font-size:48px;color:#203649">Hello</div>`;

// The satori engine can't run in node (wasm via `?url`), so it's always mocked.
// `vi.resetModules()` + `vi.doMock()` per test gives a fresh factory each time, which
// is what lets a test observe whether render.js actually imported the module.
function mockSatoriEngine() {
	const state = {
		evaluated: false,
		render: vi.fn(async (_html: string, options: { format?: string }) =>
			options.format === "svg" ? "<svg/>" : new Uint8Array([0x89, 0x50, 0x4e, 0x47])
		),
	};
	vi.doMock("$lib/client/engines/satori.js", () => {
		state.evaluated = true;
		return { render: state.render };
	});
	return state;
}

beforeEach(() => {
	vi.resetModules();
});

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

describe("client render: components in a worker", () => {
	it("rejects a component with COMPONENT_IN_WORKER when there is no document", async () => {
		const { createClientImage } = await import("$lib/client/render.js");
		expect(typeof document).toBe("undefined");
		await expect(
			createClientImage(Card, { engine: "takumi", width: 600, height: 300 }, { title: "t", subtitle: "s", num1: 1, num2: 2 })
		).rejects.toMatchObject({ name: "ImageResponseError", code: ErrorCodes.COMPONENT_IN_WORKER });
	});

	it("still renders HTML strings without a document", async () => {
		const { createClientImage } = await import("$lib/client/render.js");
		const out = (await createClientImage(html, { engine: "takumi", width: 600, height: 300 })) as Uint8Array;
		expect(Array.from(out.subarray(0, 4))).toEqual([0x89, 0x50, 0x4e, 0x47]);
	});
});

describe("client render: lazy engine dispatch", () => {
	it("defaults to takumi and never loads the satori engine module", async () => {
		const satori = mockSatoriEngine();
		const { createClientImage } = await import("$lib/client/render.js");
		const out = (await createClientImage(html, { width: 600, height: 300 })) as Uint8Array;
		expect(Array.from(out.subarray(0, 4))).toEqual([0x89, 0x50, 0x4e, 0x47]);
		expect(satori.evaluated).toBe(false);
	});

	it("loads the satori engine module only when engine is satori", async () => {
		const satori = mockSatoriEngine();
		const { createClientImage } = await import("$lib/client/render.js");
		const out = await createClientImage(html, { engine: "satori", width: 600, height: 300, format: "png" });
		expect(satori.evaluated).toBe(true);
		expect(satori.render).toHaveBeenCalledTimes(1);
		expect(out).toBeInstanceOf(Uint8Array);
	});

	it("does not load any engine when the worker guard fires", async () => {
		const satori = mockSatoriEngine();
		const { createClientImage } = await import("$lib/client/render.js");
		await expect(
			createClientImage(Card, { engine: "satori", width: 600, height: 300 }, { title: "t", subtitle: "s", num1: 1, num2: 2 })
		).rejects.toMatchObject({ code: ErrorCodes.COMPONENT_IN_WORKER });
		expect(satori.evaluated).toBe(false);
	});
});
