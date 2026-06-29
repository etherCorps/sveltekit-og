import { Renderer } from "takumi-js/wasm";

/**
 * Node.js backend. We use the WASM renderer (not the native @takumi-rs/core
 * addon) for portability: the native addon's binary is not traced into
 * serverless bundles (Vercel/Netlify) and pulls non-bundlable native code into
 * edge worker bundles. WASM works uniformly across Node, serverless, and edge —
 * the same approach this library already uses for resvg.
 *
 * `takumi-js/wasm` auto-initializes the wasm binary on import via the bundler's
 * picked binary (synchronous `initSync` from disk on Node), so there is nothing
 * to await here.
 * */
export default {
	initWasmPromise: Promise.resolve(),
	Renderer,
};
