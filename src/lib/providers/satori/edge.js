import _satori, { init } from "satori/standalone";

// On worker-like runtimes (Cloudflare Workers, Edge) the default `satori` entry
// fails: it bundles yoga's layout wasm as base64 and compiles it at runtime,
// which Workers block ("Wasm code generation disallowed by embedder").
//
// `satori/standalone` exposes `init()` so we can hand it a pre-compiled
// WebAssembly.Module instead. Importing the vendored yoga.wasm with `?module`
// makes the consumer bundler emit a real CompiledWasm module, so no runtime
// byte compilation happens. Mirrors providers/resvg/edge.js.
export default {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	initWasmPromise: init(import("./yoga.wasm?module").then((r) => r.default || r)),
	satori: _satori,
};
