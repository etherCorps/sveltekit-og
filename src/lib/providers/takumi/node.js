import { Renderer } from "takumi-js/node";

/**
 * Native Node.js backend (@takumi-rs/core). The renderer is a native addon, so
 * there is no WASM to initialize — construction is synchronous.
 * */
export default {
	initWasmPromise: Promise.resolve(),
	Renderer,
};
