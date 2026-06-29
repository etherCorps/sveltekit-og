import { init, Renderer } from "takumi-js/wasm";

// Worker-like runtimes (Cloudflare Workers, Vercel Edge) can't compile WASM at
// runtime, so we hand the wasm-bindgen `init` a pre-compiled module. Importing
// the vendored takumi.wasm with `?module` makes the consumer bundler emit a real
// CompiledWasm module — mirrors providers/resvg/edge.js and providers/satori/edge.js.
export default {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	initWasmPromise: init({
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		module_or_path: import("./takumi.wasm?module").then((r) => r.default || r),
	}),
	Renderer,
};
