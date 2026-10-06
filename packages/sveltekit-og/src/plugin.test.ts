import { describe, it, expect } from "vitest";
import { sveltekitOG } from "$lib/plugin.js";

// The unwasm rollup plugin must only touch the SSR bundle. On the client build it
// rewrites the /client entry's takumi wasm into something WebAssembly.instantiate
// can't load ("Import #0 ./takumi_wasm_bg.js: module is not an object").
//
// SvelteKit sets `build.ssr` from its own `config` hook, after Vite has already
// computed `env.isSsrBuild` (false), so the merged config is the reliable signal.
describe("sveltekitOG vite plugin", () => {
	const env = { command: "build" as const, mode: "production" };
	type Hook = (c: { build?: { ssr?: boolean } }, e: unknown) => { build?: { rollupOptions?: { plugins?: unknown[] } } } | undefined;
	const call = (config: { build?: { ssr?: boolean } }, isSsrBuild: boolean) =>
		(sveltekitOG().config as Hook)(config, { ...env, isSsrBuild });
	const pluginsOf = (r: ReturnType<typeof call>) => r?.build?.rollupOptions?.plugins ?? [];

	it("adds the wasm rollup plugin when SvelteKit's merged config says ssr", () => {
		expect(pluginsOf(call({ build: { ssr: true } }, false))).toHaveLength(1);
	});

	it("adds it when Vite itself reports an SSR build", () => {
		expect(pluginsOf(call({}, true))).toHaveLength(1);
	});

	it("leaves the client build alone", () => {
		expect(pluginsOf(call({ build: { ssr: false } }, false))).toHaveLength(0);
		expect(pluginsOf(call({}, false))).toHaveLength(0);
	});

	it("runs after sveltekit() regardless of plugin order", () => {
		expect(sveltekitOG().enforce).toBe("post");
	});
});
