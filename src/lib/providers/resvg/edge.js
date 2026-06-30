import { Resvg as _Resvg, initWasm } from "@resvg/resvg-wasm";

export default {
	// Load resvg's wasm straight from the dependency (it exports `./index_bg.wasm`)
	// via `?module` so the consumer bundler emits a real CompiledWasm module. This
	// avoids shipping a vendored copy in our package.
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	initWasmPromise: initWasm(
		import("@resvg/resvg-wasm/index_bg.wasm?module").then((r) => r.default || r)
	),
	Resvg: _Resvg,
};
