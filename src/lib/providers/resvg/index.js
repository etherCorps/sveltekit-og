import { Resvg as _Resvg, initWasm } from "@resvg/resvg-wasm";

export default {
	// load resvg's wasm from the dep (it exports ./index_bg.wasm) via ?module, so we
	// don't vendor a copy. precompiled module works on node + workers alike.
	initWasmPromise: initWasm(
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		import("@resvg/resvg-wasm/index_bg.wasm?module").then((r) => r.default || r)
	),
	Resvg: _Resvg,
};
