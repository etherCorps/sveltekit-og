import { Resvg as _Resvg, initWasm } from "@resvg/resvg-wasm";

export default {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	initWasmPromise: initWasm(
		// @ts-ignore
		// Vendored wasm: a relative import resolves inside this package so the
		// consumer's bundler emits a real CompiledWasm module. A bare
		// "@resvg/resvg-wasm/...?module" specifier falls back to runtime byte
		// compilation, which Cloudflare Workers block.
		import("./resvg.wasm?module").then((r) => r.default || r)
	),
	Resvg: _Resvg,
};
