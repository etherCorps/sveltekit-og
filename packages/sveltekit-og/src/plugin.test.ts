import { describe, it, expect, vi } from "vitest";
import { sveltekitOG } from "$lib/plugin.js";

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
const plugin = () => sveltekitOG()[0] as P;

describe("sveltekitOG vite plugin", () => {
	it("is build-only and carries the wasm hooks itself", () => {
		const p = plugin();
		expect(p.apply).toBe("build");
		expect(p.config).toBeUndefined();
		for (const h of ["resolveId", "load", "transform"] as const)
			expect(typeof p[h]?.handler).toBe("function");
	});

	it("applies only to server environments (Vite 6+ / SvelteKit 3)", () => {
		const p = plugin();
		expect(p.applyToEnvironment?.({ name: "ssr", config: { consumer: "server" } })).toBe(true);
		expect(p.applyToEnvironment?.({ name: "client", config: { consumer: "client" } })).toBe(
			false
		);
	});

	it("skips hooks on the client build when there is no environment (Vite 5 / SvelteKit 2)", async () => {
		const p = plugin();
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
		const p = plugin();
		const ctx = { resolve: vi.fn(async () => ({ id: "/abs/yoga.wasm?module" })) };
		const r = await p.resolveId!.handler.call(ctx, "satori/yoga.wasm?module", "/app.js", {
			ssr: true,
		});
		expect(ctx.resolve).toHaveBeenCalledTimes(1);
		expect(r).toMatchObject({ id: "/abs/yoga.wasm?module" });
	});

	it("defers to the environment when one exists (Vite 6+)", async () => {
		const p = plugin();
		const client = { environment: { config: { consumer: "client" } }, resolve: vi.fn() };
		expect(
			await p.resolveId!.handler.call(client, "satori/yoga.wasm?module", "/app.js", {
				ssr: true,
			})
		).toBeNull();
		expect(client.resolve).not.toHaveBeenCalled();
	});
});

// satori >=0.33 imports harfbuzzjs, whose emscripten loader needs fs/__dirname and fetches
// hb.wasm from beside itself; the shim swaps it for one fed through instantiateWasm.
describe("harfbuzz shim", () => {
	type HB = {
		configResolved(c: { command: string }): void;
		resolveId(this: unknown, id: string, importer: string, opts: { ssr?: boolean }): unknown;
		load(id: string): string | null;
		transform(code: string, id: string): { code: string } | null;
	};
	const hb = (command: string) => {
		const p = sveltekitOG()[1] as unknown as HB;
		p.configResolved({ command });
		return p;
	};

	it("routes harfbuzzjs to a server/client shim, but not in dev SSR", () => {
		expect(hb("build").resolveId.call({}, "harfbuzzjs", "/s.js", { ssr: true })).toMatch(
			/harfbuzz:server$/
		);
		expect(hb("build").resolveId.call({}, "harfbuzzjs", "/s.js", { ssr: false })).toMatch(
			/harfbuzz:client$/
		);
		expect(hb("serve").resolveId.call({}, "harfbuzzjs", "/s.js", { ssr: false })).toMatch(
			/harfbuzz:client$/
		);
		expect(hb("serve").resolveId.call({}, "harfbuzzjs", "/s.js", { ssr: true })).toBeNull();
		expect(hb("build").resolveId.call({}, "satori", "/s.js", { ssr: true })).toBeNull();
	});

	it("feeds emscripten the wasm: ?module/bytes on the server, ?url on the client", () => {
		const p = hb("build");
		const server = p.load("\0sveltekit-og:harfbuzz:server")!;
		expect(server).toContain('hb.wasm?module"');
		expect(server).toContain("instantiateWasm");
		expect(p.load("\0sveltekit-og:harfbuzz:client")).toContain('hb.wasm?url"');
	});

	it("patches the real hb.js / hbjs.js into ESM with no fs or env sniffing", async () => {
		const { createRequire } = await import("node:module");
		const { readFileSync } = await import("node:fs");
		const fromSatori = createRequire(
			createRequire(import.meta.url).resolve("satori/package.json")
		);
		const p = hb("build");
		for (const [name, exported] of [
			["hb.js", "createHarfBuzz"],
			["hbjs.js", "hbjs"],
		]) {
			const path = fromSatori.resolve(`harfbuzzjs/${name}`);
			const out = p.transform(readFileSync(path, "utf8"), path)!.code;
			expect(out).toMatch(new RegExp(`export default ${exported};\\s*$`));
			expect(out).not.toContain('require("fs")');
			expect(out).not.toContain("process.versions");
			expect(out).not.toContain("module.exports = hbjs");
		}
	});
});
