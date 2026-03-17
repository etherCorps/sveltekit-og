import { Resvg as _Resvg, initWasm } from "@resvg/resvg-wasm";

export default {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	initWasmPromise: initWasm(
		// @ts-ignore
		import("@resvg/resvg-wasm/index_bg.wasm?module").then((r) => r.default || r)
	),
	Resvg: _Resvg,
};
