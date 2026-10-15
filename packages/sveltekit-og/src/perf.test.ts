import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { CustomFont } from "#lib/fonts.js";

// #6: within one isolate the second render re-fetches no font and instantiates no
// wasm, and HTML-string renders never pay for svelte/server.
const html = `<div style="display:flex;width:100%;height:100%;font-size:40px">hi</div>`;
const fontData = readFileSync(
	new URL("./routes/(components)/SpaceMono-Regular.ttf", import.meta.url)
);
const size = { width: 200, height: 100 };

describe("fonts resolve once per font object", () => {
	it.each(["takumi", "satori"] as const)(
		"%s: a loader runs once across renders",
		async (engine) => {
			const { renderImage } = await import("#lib/ssr/render.js");
			const loader = vi.fn(async () => fontData);
			const fonts = [{ name: "Space Mono", data: loader, weight: 400 as const }];
			await renderImage(html, { engine, ...size, fonts } as never);
			await renderImage(html, { engine, ...size, fonts } as never);
			expect(loader).toHaveBeenCalledTimes(1);
		}
	);

	it("a new font object loads again; a failed load retries", async () => {
		const { resolveFontInputs } = await import("#lib/core/fonts.js");
		const loader = vi
			.fn()
			.mockRejectedValueOnce(new Error("offline"))
			.mockResolvedValue(fontData);
		const font = { name: "x", data: loader };
		await expect(resolveFontInputs([font])).rejects.toMatchObject({ code: "FONT_LOAD_FAILED" });
		await resolveFontInputs([font]);
		await resolveFontInputs([font]);
		await resolveFontInputs([{ ...font }]);
		expect(loader).toHaveBeenCalledTimes(3); // fail, retry, new object
	});

	it("CustomFont/GoogleFont objects resolve once too", async () => {
		const { resolveFontInputs } = await import("#lib/core/fonts.js");
		const input = vi.fn(async () => fontData);
		const font = new CustomFont("Space Mono", input, { weight: 400 });
		await resolveFontInputs([font]);
		await resolveFontInputs([font]);
		expect(input).toHaveBeenCalledTimes(1);
	});
});

describe("wasm instantiates once per isolate", () => {
	const spies = () => [
		vi.spyOn(WebAssembly, "instantiate"),
		vi.spyOn(WebAssembly, "instantiateStreaming"),
		vi.spyOn(WebAssembly, "compile"),
		vi.spyOn(WebAssembly, "Instance" as never),
		vi.spyOn(WebAssembly, "Module" as never),
	];
	afterEach(() => vi.restoreAllMocks());

	it.each([
		["takumi", "png"],
		["takumi", "svg"],
		["satori", "svg"],
		["satori", "png"],
	] as const)("%s %s: second render does no wasm work", async (engine, format) => {
		const { renderImage } = await import("#lib/ssr/render.js");
		const fonts = [{ name: "Space Mono", data: fontData, weight: 400 as const }];
		await renderImage(html, { engine, format, ...size, fonts } as never); // warm-up: may instantiate
		const s = spies();
		await renderImage(html, { engine, format, ...size, fonts } as never);
		for (const spy of s) expect(spy).not.toHaveBeenCalled();
	});
});

describe("svelte/server loads lazily", () => {
	beforeEach(() => vi.resetModules());

	it("is never evaluated for HTML strings, once for components", async () => {
		const evaluated = vi.fn();
		vi.doMock("svelte/server", async (importOriginal) => {
			evaluated();
			return importOriginal();
		});
		const { renderImage } = await import("#lib/ssr/render.js");
		// after resetModules the component must come from the same Svelte instance as the mock
		const { default: OG } = await import("./routes/(components)/OG.svelte");
		await renderImage(html, size);
		await renderImage(html, { ...size, format: "svg" });
		expect(evaluated).not.toHaveBeenCalled();
		const props = { text: "a", spanText: "b" };
		await renderImage(OG, size, props);
		await renderImage(OG, size, props);
		expect(evaluated).toHaveBeenCalledTimes(1);
		vi.doUnmock("svelte/server");
	});
});
