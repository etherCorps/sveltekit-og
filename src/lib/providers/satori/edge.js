import _satori, { init } from "satori/standalone";

// On worker-like runtimes (Cloudflare Workers, Edge) the default `satori` entry
// fails: it bundles yoga's layout wasm as base64 and compiles it at runtime,
// which Workers block ("Wasm code generation disallowed by embedder").
//
// `satori/standalone` exposes `init()` so we can hand it a pre-compiled
// WebAssembly.Module instead. We import satori's own yoga wasm (it exports
// `./yoga.wasm`) with `?module` so the consumer bundler emits a real CompiledWasm
// module — no runtime byte compilation, and no vendored copy in our package.
// Mirrors providers/resvg/edge.js.
export default {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	initWasmPromise: init(import("satori/yoga.wasm?module").then((r) => r.default || r)),
	satori: _satori,
};
