import _satori, { init } from "satori/standalone";

// the default satori entry compiles yoga's wasm at runtime, which workers block
// ("Wasm code generation disallowed by embedder"). satori/standalone takes a
// precompiled module via init(), so we hand it satori's own yoga wasm (it exports
// ./yoga.wasm) through ?module — no vendored copy. mirrors providers/resvg.
export default {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	initWasmPromise: init(import("satori/yoga.wasm?module").then((r) => r.default || r)),
	satori: _satori,
};
