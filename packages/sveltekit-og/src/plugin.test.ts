import { describe, it, expect, vi } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { sveltekitOG, missingEngines, stubSource, STUB_PREFIX } from "#lib/plugin.js";
import { ErrorCodes } from "#lib/helpers/error-handler.js";

// The unwasm hooks must only touch the SSR bundle. On the client build they rewrite
// the /client entry's takumi wasm into something WebAssembly.instantiate can't load
// ("Import #0 ./takumi_wasm_bg.js: module is not an object").
//
// Two Vite generations, one plugin:
// - Vite 6+ (SvelteKit 3 builds via the Environment API; no build.ssr/isSsrBuild):
//   `applyToEnvironment` keeps the plugin off the client environment.
// - Vite 5 (SvelteKit 2 runs separate client + SSR builds): hooks receive
//   `options.ssr`, so each wrapped hook no-ops unless it's the SSR build.
// Version sniffing is not an option: `import { version } from "vite"` resolves to
// the plugin's own copy of vite, not the consumer's.
type Hook = { handler: (this: unknown, ...args: unknown[]) => unknown };
type P = ReturnType<typeof sveltekitOG>[number] & {
	applyToEnvironment?: (env: { name: string; config: { consumer: string } }) => boolean;
	resolveId?: Hook;
	load?: Hook;
	transform?: Hook;
};
const wasm = () => sveltekitOG()[0] as P;

describe("sveltekitOG vite plugin: wasm (SSR only)", () => {
	it("is build-only and carries the wasm hooks itself", () => {
		const p = wasm();
		expect(p.name).toBe("vite-plugin-sveltekit-og");
		expect(p.apply).toBe("build");
		expect(p.config).toBeUndefined();
		for (const h of ["resolveId", "load", "transform"] as const)
			expect(typeof p[h]?.handler).toBe("function");
	});

	it("applies only to server environments (Vite 6+ / SvelteKit 3)", () => {
		const p = wasm();
		expect(p.applyToEnvironment?.({ name: "ssr", config: { consumer: "server" } })).toBe(true);
		expect(p.applyToEnvironment?.({ name: "client", config: { consumer: "client" } })).toBe(
			false
		);
	});

	it("skips hooks on the client build when there is no environment (Vite 5 / SvelteKit 2)", async () => {
		const p = wasm();
		const ctx = { resolve: vi.fn(async () => ({ id: "/abs/yoga.wasm?module" })) };
		expect(
			await p.resolveId!.handler.call(ctx, "satori/yoga.wasm?module", "/app.js", {
				ssr: false,
			})
		).toBeNull();
		expect(await p.load!.handler.call(ctx, "/abs/yoga.wasm?module", { ssr: false })).toBeNull();
		expect(
			await p.transform!.handler.call(ctx, "code", "/abs/yoga.wasm?module", { ssr: false })
		).toBeNull();
		expect(ctx.resolve).not.toHaveBeenCalled();
	});

	it("runs hooks on the SSR build (Vite 5 / SvelteKit 2)", async () => {
		const p = wasm();
		const ctx = { resolve: vi.fn(async () => ({ id: "/abs/yoga.wasm?module" })) };
		const r = await p.resolveId!.handler.call(ctx, "satori/yoga.wasm?module", "/app.js", {
			ssr: true,
		});
		expect(ctx.resolve).toHaveBeenCalledTimes(1);
		expect(r).toMatchObject({ id: "/abs/yoga.wasm?module" });
	});

	it("defers to the environment when one exists (Vite 6+)", async () => {
		const p = wasm();
		const client = { environment: { config: { consumer: "client" } }, resolve: vi.fn() };
		expect(
			await p.resolveId!.handler.call(client, "satori/yoga.wasm?module", "/app.js", {
				ssr: true,
			})
		).toBeNull();
		expect(client.resolve).not.toHaveBeenCalled();
	});
});

// Engines are optional peers. The second plugin aliases every module that statically
// imports a missing engine's packages to a stub, in every environment, dev included.
type EnginesPlugin = ReturnType<typeof sveltekitOG>[1] & {
	resolveId: (source: string, importer?: string) => string | null;
	load: (id: string) => string | null;
};
const engines = (
	list?: Parameters<typeof sveltekitOG>[0] extends infer O
		? O extends { engines?: infer E }
			? E
			: never
		: never
) => sveltekitOG({ engines: list })[1] as unknown as EnginesPlugin;
const packageSrc = new URL("./lib", import.meta.url).pathname; // this package has all three engine packages
const emptyRoot = mkdtempSync(join(tmpdir(), "sko-empty-"));

describe("sveltekitOG vite plugin: optional engines", () => {
	it("probes from the package's location by walking node_modules, ignoring NODE_PATH", () => {
		expect(missingEngines(packageSrc)).toEqual([]);
		expect(missingEngines(emptyRoot)).toEqual(["takumi", "satori"]);
		expect(missingEngines()).toEqual([]); // default: from plugin.ts itself
	});

	it("the engines option pins the list instead of probing", () => {
		expect(engines(["takumi"]).resolveId("./engines/satori.js", "/x/core/render.js")).toBe(
			`${STUB_PREFIX}satori`
		);
		expect(
			engines(["takumi"]).resolveId("./engines/takumi.js", "/x/core/render.js")
		).toBeNull();
		expect(engines([]).resolveId("./engines/takumi.js", "/x/core/render.js")).toBe(
			`${STUB_PREFIX}takumi`
		);
		expect(
			engines(["takumi", "satori"]).resolveId("./engines/satori.js", "/x/core/render.js")
		).toBeNull();
	});

	it("runs everywhere: no apply/environment gate, enforce pre", () => {
		const p = engines([]);
		expect(p.name).toBe("vite-plugin-sveltekit-og:engines");
		expect(p.apply).toBeUndefined();
		expect(p.enforce).toBe("pre");
	});

	it("stubs every module of a missing engine, in src and dist form", () => {
		const p = engines([]);
		const dist = "/app/node_modules/@ethercorps/sveltekit-og/dist";
		for (const m of [
			"core/engines/satori.js",
			"client/satori-wasm.js",
			"providers/instances.js",
		])
			expect(p.resolveId(`${dist}/${m}`, `${dist}/core/render.js`)).toBe(
				`${STUB_PREFIX}satori`
			);
		expect(p.resolveId("./engines/takumi.js", `${dist}/core/render.js`)).toBe(
			`${STUB_PREFIX}takumi`
		);
		expect(p.resolveId("./engines/takumi.ts", "/pkg/src/lib/core/render.ts")).toBe(
			`${STUB_PREFIX}takumi`
		);
	});

	it("leaves installed engines and unrelated modules alone", () => {
		expect(engines().resolveId("./engines/satori.js", "/x/core/render.js")).toBeNull(); // probed: all present here
		expect(engines([]).resolveId("./fonts.js", "/x/core/render.js")).toBeNull();
		expect(engines([]).resolveId("./engines/satori.js")).toBeNull(); // entry, no importer
	});

	it("the stub throws like a missing package, so core maps it to ENGINE_NOT_INSTALLED", async () => {
		const p = engines([]);
		const code = p.load(`${STUB_PREFIX}satori`)!;
		expect(code).toBe(stubSource("satori"));
		expect(p.load("/anything/else.js")).toBeNull();
		await expect(
			import(`data:text/javascript,${encodeURIComponent(code)}`)
		).rejects.toMatchObject({
			code: "ERR_MODULE_NOT_FOUND",
		});
	});

	it("end to end through core: stubbed engine rejects with the install command", async () => {
		vi.resetModules();
		vi.doMock("#lib/core/engines/satori.js", () => {
			throw Object.assign(new Error("stubbed"), { code: "ERR_MODULE_NOT_FOUND" });
		});
		const { renderImage } = await import("#lib/ssr/render.js");
		await expect(renderImage("<div>hi</div>", { engine: "satori" })).rejects.toMatchObject({
			name: "ImageResponseError",
			code: ErrorCodes.ENGINE_NOT_INSTALLED,
			message: 'Engine "satori" is not installed. Run: pnpm add satori @resvg/resvg-wasm',
		});
		vi.doUnmock("#lib/core/engines/satori.js");
	});
});
