import { describe, it, expect, vi, beforeEach } from "vitest";
import { ErrorCodes } from "#lib/helpers/error-handler.js";
import { isModuleNotFound } from "#lib/core/packages.js";

// A missing engine package rejects with ENGINE_NOT_INSTALLED on both platforms, in
// every runtime's phrasing of "module not found"; other load failures pass through.
const html = `<div style="display:flex">hi</div>`;

// vitest can't take a variable dynamic import, so pick the platform module explicitly
const platform = (p: "ssr" | "client") =>
	p === "ssr" ? import("#lib/ssr/render.js") : import("#lib/client/render.js");

const notFound = (shape: Record<string, unknown>) => () => {
	throw Object.assign(new Error(String(shape.message ?? "nope")), shape);
};

beforeEach(() => vi.resetModules());

describe("isModuleNotFound", () => {
	it.each([
		["node", { code: "ERR_MODULE_NOT_FOUND" }],
		["cjs/bun", { code: "MODULE_NOT_FOUND" }],
		["vite dev", { message: 'Failed to resolve import "takumi-js" from "x.js"' }],
		["deno", { message: 'Module not found "file:///x/takumi-js"' }],
		["node message only", { message: "Cannot find package 'satori' imported from x" }],
	] as [string, Record<string, unknown>][])("%s", (_, shape) => {
		expect(isModuleNotFound(Object.assign(new Error(String(shape.message ?? "")), shape))).toBe(
			true
		);
	});

	it("looks through a wrapping error's cause", () => {
		const inner = Object.assign(new Error("x"), { code: "ERR_MODULE_NOT_FOUND" });
		expect(isModuleNotFound(new Error("loader failed", { cause: inner }))).toBe(true);
		expect(isModuleNotFound(new Error("outer", { cause: new SyntaxError("inner") }))).toBe(
			false
		);
	});

	it("is false for anything else", () => {
		expect(isModuleNotFound(new SyntaxError("Unexpected token"))).toBe(false);
		expect(isModuleNotFound(new TypeError("Failed to fetch dynamically imported module"))).toBe(
			false
		);
		expect(isModuleNotFound(null)).toBe(false);
	});
});

describe("missing engine at runtime", () => {
	it.each(["ssr", "client"] as const)(
		"%s: takumi → ENGINE_NOT_INSTALLED with the install command",
		async (p) => {
			vi.doMock("#lib/core/engines/takumi.js", notFound({ code: "ERR_MODULE_NOT_FOUND" }));
			const { renderImage } = await platform(p);
			await expect(renderImage(html, {})).rejects.toMatchObject({
				code: ErrorCodes.ENGINE_NOT_INSTALLED,
				message: 'Engine "takumi" is not installed. Run: pnpm add takumi-js',
			});
		}
	);

	it.each(["ssr", "client"] as const)(
		"%s: satori → ENGINE_NOT_INSTALLED naming both packages",
		async (p) => {
			vi.doMock(
				"#lib/core/engines/satori.js",
				notFound({ message: "Cannot find package 'satori'" })
			);
			const { renderImage } = await platform(p);
			await expect(renderImage(html, { engine: "satori" })).rejects.toMatchObject({
				code: ErrorCodes.ENGINE_NOT_INSTALLED,
				message: 'Engine "satori" is not installed. Run: pnpm add satori @resvg/resvg-wasm',
			});
		}
	);

	it("keeps the load error as originalError", async () => {
		vi.doMock("#lib/core/engines/takumi.js", notFound({ code: "ERR_MODULE_NOT_FOUND" }));
		const { renderImage } = await import("#lib/ssr/render.js");
		await expect(renderImage(html, {})).rejects.toSatisfy(
			(e: { originalError?: unknown }) => e.originalError instanceof Error
		);
	});

	it("a broken engine module (not missing) is rethrown untouched", async () => {
		vi.doMock("#lib/core/engines/takumi.js", () => {
			throw new SyntaxError("Unexpected token");
		});
		const { renderImage } = await import("#lib/ssr/render.js");
		// (vitest wraps the factory's throw; the point is: no ENGINE_NOT_INSTALLED relabel)
		await expect(renderImage(html, {})).rejects.toSatisfy(
			(e: { code?: string }) => e.code !== ErrorCodes.ENGINE_NOT_INSTALLED
		);
	});

	it("retries the load on the next call instead of caching the failure", async () => {
		const factory = vi.fn(notFound({ code: "ERR_MODULE_NOT_FOUND" }));
		vi.doMock("#lib/core/engines/takumi.js", factory);
		const { renderImage } = await import("#lib/ssr/render.js");
		await expect(renderImage(html, {})).rejects.toMatchObject({
			code: ErrorCodes.ENGINE_NOT_INSTALLED,
		});
		await expect(renderImage(html, {})).rejects.toMatchObject({
			code: ErrorCodes.ENGINE_NOT_INSTALLED,
		});
		expect(factory).toHaveBeenCalledTimes(2);
	});
});
