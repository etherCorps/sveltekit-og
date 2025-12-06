import { Resvg as _Resvg, initWasm } from "@resvg/resvg-wasm";

/**
 * Fetch will be called only once whenever you load this file.
 * In vercel serverless functions, fetch will run on cold start.
 * In Node.js (Stateful e.g. Linux servers), Fetch will run once when you start your server.
 * */
const resvgWasm = fetch("https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm");

export default {
	initWasmPromise: initWasm(resvgWasm),
	Resvg: _Resvg,
};
