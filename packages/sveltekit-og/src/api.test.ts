import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import * as root from "#lib/index.js";
import * as takumi from "#lib/takumi/index.js";
import * as client from "#lib/client/index.js";
import { CustomFont } from "#lib/fonts.js";
import { ErrorCodes } from "#lib/helpers/error-handler.js";
import OG from "./routes/(components)/OG.svelte";

// v5 public surface (#3): root and /client export the same three names with the same
// signatures, Takumi is the default everywhere, ./takumi is an alias of the root.
const html = `<div style="display:flex;width:100%;height:100%;align-items:center;justify-content:center;font-size:48px">Hello</div>`;
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];
const head = (b: ArrayBuffer | Uint8Array) => Array.from(new Uint8Array(b).subarray(0, 4));
const fontData = readFileSync(
	new URL("./routes/(components)/SpaceMono-Regular.ttf", import.meta.url)
);

describe("public API: one surface", () => {
	it("root, ./takumi and /client export ImageResponse, createImage and renderImage", () => {
		for (const entry of [root, takumi, client]) {
			expect(typeof entry.ImageResponse).toBe("function");
			expect(typeof entry.createImage).toBe("function");
			expect(typeof entry.renderImage).toBe("function");
		}
	});

	it("./takumi is the root entry", () => {
		expect(takumi.ImageResponse).toBe(root.ImageResponse);
		expect(takumi.createImage).toBe(root.createImage);
		expect(takumi.renderImage).toBe(root.renderImage);
	});

	it("root defaults to Takumi: renders offline with no fonts (Satori would fetch its defaults)", async () => {
		const fetchSpy = vi.spyOn(globalThis, "fetch");
		const res = root.createImage(html, { width: 300, height: 150 });
		expect(res).toBeInstanceOf(Response);
		expect(res).toBeInstanceOf(root.ImageResponse);
		expect(head(await res.arrayBuffer())).toEqual(PNG_MAGIC);
		expect(fetchSpy).not.toHaveBeenCalled();
		fetchSpy.mockRestore();
	});

	it("renderImage returns bytes, or a string for svg", async () => {
		const png = await root.renderImage(html, { width: 300, height: 150 });
		expect(png).toBeInstanceOf(Uint8Array);
		expect(head(png as Uint8Array)).toEqual(PNG_MAGIC);
		const svg = await root.renderImage(html, { width: 300, height: 150, format: "svg" });
		expect(typeof svg).toBe("string");
		expect((svg as string).startsWith("<svg")).toBe(true);
	});

	it("components take typed props on every entry", async () => {
		const props = { text: "a", spanText: "b" };
		expect(
			head(await root.createImage(OG, { width: 300, height: 150 }, props).arrayBuffer())
		).toEqual(PNG_MAGIC);
		expect(
			head((await root.renderImage(OG, { width: 300, height: 150 }, props)) as Uint8Array)
		).toEqual(PNG_MAGIC);
	});

	it("GoogleFont/CustomFont go straight into fonts for both engines, no resolveFonts", async () => {
		const fonts = [new CustomFont("Space Mono", fontData, { weight: 400 })];
		const t = await root.renderImage(html, { width: 300, height: 150, fonts });
		expect(head(t as Uint8Array)).toEqual(PNG_MAGIC);
		const s = await root.renderImage(html, {
			engine: "satori",
			width: 300,
			height: 150,
			fonts,
		});
		expect(head(s as Uint8Array)).toEqual(PNG_MAGIC);
	});

	it("an unsupported format reaches the caller with its own code, not UNKNOWN_ERROR", async () => {
		const res = root.createImage(html, { engine: "satori", format: "webp" as never });
		await expect(res.arrayBuffer()).rejects.toMatchObject({
			name: "ImageResponseError",
			code: ErrorCodes.UNSUPPORTED_FORMAT,
		});
	});
});

describe("public API: types (enforced by svelte-check, not at runtime)", () => {
	it("engine narrows the options", () => {
		const typeChecks = () => {
			root.createImage(html, { format: "webp" });
			root.createImage(html, { engine: "takumi", format: "jpeg", quality: 80 });
			root.createImage(html, { engine: "satori", format: "svg" });
			client.createImage(html, { format: "webp" });
			// @ts-expect-error satori only emits png/svg
			root.createImage(html, { engine: "satori", format: "webp" });
			// @ts-expect-error quality is a takumi option
			root.createImage(html, { engine: "satori", quality: 80 });
			// @ts-expect-error tailwindConfig is a satori option
			root.createImage(html, { tailwindConfig: {} });
			// @ts-expect-error resvg is a satori option
			root.createImage(html, { resvg: { background: "#fff" } });
		};
		expect(typeChecks).toBeTypeOf("function");
	});
});

describe("public API: engine pass-throughs", () => {
	beforeEach(() => vi.resetModules());

	it("satori/resvg objects reach satori() and the Resvg constructor last", async () => {
		const satoriFn = vi.fn(async (..._args: unknown[]) => "<svg/>");
		const resvgCtor = vi.fn(function (this: Record<string, unknown>, ..._args: unknown[]) {
			this.render = () => ({ asPng: () => new Uint8Array(PNG_MAGIC), free() {} });
			this.free = () => {};
		});
		const { render } = await import("#lib/core/engines/satori.js");
		await render(
			{ type: "div", props: {} },
			{
				engine: "satori",
				width: 10,
				height: 10,
				format: "png",
				fonts: [],
				satori: { embedFont: false, pointScaleFactor: 2 },
				resvg: { background: "#ff0000", fitTo: { mode: "original" } },
			},
			{
				satori: async () => satoriFn as never,
				resvg: async () => resvgCtor as never,
				fonts: async () => [],
			}
		);
		expect(satoriFn.mock.calls[0][1]).toMatchObject({ embedFont: false, pointScaleFactor: 2 });
		expect(resvgCtor.mock.calls[0][1]).toEqual({
			background: "#ff0000",
			fitTo: { mode: "original" },
		});
	});

	it("takumi object reaches takumi-js render last", async () => {
		const render = vi.fn(async (..._args: unknown[]) => new Uint8Array(PNG_MAGIC));
		vi.doMock("takumi-js", () => ({ render, renderSvg: vi.fn() }));
		vi.doMock("takumi-js/wasm", () => ({
			default: undefined,
			init: async () => {},
			Renderer: class {
				registerFont = async () => {};
			},
		}));
		const engine = await import("#lib/core/engines/takumi.js");
		await engine.render(
			{ type: "div", props: {} },
			{
				width: 10,
				height: 10,
				format: "png",
				fonts: [],
				takumi: { signal: AbortSignal.timeout(1000), quality: 1 } as never,
			}
		);
		expect(render.mock.calls[0][1]).toMatchObject({ width: 10, quality: 1 });
		expect(
			(render.mock.calls[0][1] as { signal?: unknown } | undefined)?.signal
		).toBeInstanceOf(AbortSignal);
	});
});
