import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { CustomFont } from "$lib/fonts.js";
import { ErrorCodes } from "$lib/helpers/error-handler.js";
import type { Platform } from "$lib/core/render.js";

// core/render.ts is the one pipeline behind the root, ./takumi and /client entries.
// Engines are mocked per test (fresh module graph) so we can see which one loaded
// and exactly what it was handed; real renders are covered in the entry tests.
const fontData = readFileSync(
	new URL("./routes/(components)/SpaceMono-Regular.ttf", import.meta.url)
);
const html = `<div style="display:flex">hi</div>`;
const FALLBACK = [
	{ name: "Fallback", data: new ArrayBuffer(8), weight: 400, style: "normal" as const },
];

function mockEngines() {
	const state = {
		satori: vi.fn(async (..._args: unknown[]) => "<svg/>"),
		takumi: vi.fn(async (..._args: unknown[]) => "<svg/>"),
	};
	vi.doMock("$lib/core/engines/satori.js", () => ({ render: state.satori }));
	vi.doMock("$lib/core/engines/takumi.js", () => ({ render: state.takumi }));
	return state;
}

function fakePlatform(): Platform {
	return {
		componentToHtml: vi.fn(() => html),
		satori: { satori: vi.fn(), resvg: vi.fn(), fonts: vi.fn(async () => FALLBACK) },
	};
}

const load = () => import("$lib/core/render.js");

beforeEach(() => {
	vi.resetModules();
});

describe("core: engine selection", () => {
	it("defaults to takumi", async () => {
		const engines = mockEngines();
		const { renderImage } = await load();
		await renderImage(html, {}, undefined, fakePlatform());
		expect(engines.takumi).toHaveBeenCalledTimes(1);
		expect(engines.satori).not.toHaveBeenCalled();
	});

	it("uses satori when asked, handing it the platform's assets", async () => {
		const engines = mockEngines();
		const platform = fakePlatform();
		const { renderImage } = await load();
		await renderImage(html, { engine: "satori" }, undefined, platform);
		expect(engines.satori).toHaveBeenCalledTimes(1);
		expect(engines.satori.mock.calls[0][2]).toBe(platform.satori);
		expect(engines.takumi).not.toHaveBeenCalled();
	});

	it("turns components into HTML through the platform", async () => {
		mockEngines();
		const platform = fakePlatform();
		const { renderImage } = await load();
		const Component = (() => {}) as never;
		await renderImage(Component, {}, { a: 1 }, platform);
		expect(platform.componentToHtml).toHaveBeenCalledWith(Component, { a: 1 });
	});

	it("never passes response-only options to the engine", async () => {
		const engines = mockEngines();
		const { renderImage } = await load();
		await renderImage(
			html,
			{ engine: "satori", status: 201, headers: { a: "b" } },
			undefined,
			fakePlatform()
		);
		expect(engines.satori.mock.calls[0][1]).not.toHaveProperty("status");
		expect(engines.satori.mock.calls[0][1]).not.toHaveProperty("headers");
	});
});

describe("core: format validation", () => {
	it.each([
		["satori", "webp"],
		["satori", "jpeg"],
		["takumi", "gif"],
	])(
		"%s + %s rejects with UNSUPPORTED_FORMAT before loading an engine",
		async (engine, format) => {
			const engines = mockEngines();
			const { renderImage } = await load();
			await expect(
				renderImage(html, { engine, format } as never, undefined, fakePlatform())
			).rejects.toMatchObject({ code: ErrorCodes.UNSUPPORTED_FORMAT });
			expect(engines.satori).not.toHaveBeenCalled();
			expect(engines.takumi).not.toHaveBeenCalled();
		}
	);

	it.each(["png", "jpeg", "webp", "ico", "raw", "svg"])("takumi accepts %s", async (format) => {
		mockEngines();
		const { renderImage } = await load();
		await expect(
			renderImage(html, { format } as never, undefined, fakePlatform())
		).resolves.toBeDefined();
	});

	it("labels an unsupported format's response but errors its body", async () => {
		mockEngines();
		const { imageResponseInit } = await load();
		const { body, init } = imageResponseInit(
			html,
			{ engine: "satori", format: "webp" as never },
			undefined,
			fakePlatform()
		);
		expect((init.headers as Record<string, string>)["Content-Type"]).toBe("image/webp");
		await expect(new Response(body).arrayBuffer()).rejects.toMatchObject({
			originalError: { code: ErrorCodes.UNSUPPORTED_FORMAT },
		});
	});
});

describe("core: font resolution", () => {
	const inputs = () => [
		new CustomFont("Custom", fontData, { weight: 700 }),
		{ name: "Loader", data: async () => fontData, weight: 400 },
		{ name: "Bytes", data: fontData },
	];
	const expected = [
		{ name: "Custom", data: fontData, weight: 700, style: "normal" },
		{ name: "Loader", data: fontData, weight: 400, style: undefined },
		{ name: "Bytes", data: fontData, weight: undefined, style: undefined },
	];

	it.each(["satori", "takumi"] as const)(
		"%s gets every font kind loaded to bytes",
		async (engine) => {
			const engines = mockEngines();
			const platform = fakePlatform();
			const { renderImage } = await load();
			await renderImage(html, { engine, fonts: inputs() } as never, undefined, platform);
			expect(engines[engine].mock.calls[0][1]).toMatchObject({ fonts: expected });
			expect(platform.satori.fonts).not.toHaveBeenCalled();
		}
	);

	it("satori with no fonts gets the platform fallback", async () => {
		const engines = mockEngines();
		const { renderImage } = await load();
		await renderImage(html, { engine: "satori", fonts: [] }, undefined, fakePlatform());
		expect(engines.satori.mock.calls[0][1]).toMatchObject({ fonts: FALLBACK });
	});

	it("takumi with no fonts uses its built-in font, never the satori fallback", async () => {
		const engines = mockEngines();
		const platform = fakePlatform();
		const { renderImage } = await load();
		await renderImage(html, {}, undefined, platform);
		expect(engines.takumi.mock.calls[0][1]).toMatchObject({ fonts: [] });
		expect(platform.satori.fonts).not.toHaveBeenCalled();
	});

	it("a failing loader surfaces as FONT_LOAD_FAILED", async () => {
		mockEngines();
		const { renderImage } = await load();
		const broken = { name: "Broken", data: () => Promise.reject(new Error("404")) };
		await expect(
			renderImage(html, { fonts: [broken] }, undefined, fakePlatform())
		).rejects.toMatchObject({
			code: ErrorCodes.FONT_LOAD_FAILED,
		});
	});
});

describe("core: real render on the server platform", () => {
	it("satori takes a CustomFont directly, no resolveFonts needed", async () => {
		vi.doUnmock("$lib/core/engines/satori.js");
		const { renderImage } = await import("$lib/server/render.js");
		const svg = await renderImage(html, {
			engine: "satori",
			format: "svg",
			width: 200,
			height: 100,
			fonts: [new CustomFont("Space Mono", fontData)],
		});
		expect(svg).toContain("<svg");
	});
});
