import { Resvg as _Resvg, initWasm } from "@resvg/resvg-wasm";

// on node we hand initWasm the raw wasm bytes, not a `?module` import. the
// `?module` path only works where the bundler can emit a real CompiledWasm
// module (workers, or node with esmImport:false which inlines it) — on node
// serverless (vercel/netlify, esmImport:true) it emits an esm wasm import that
// node can't instantiate (unresolved `wbg` imports). fetching bytes works
// everywhere. runs once when this module first loads.
const resvgWasm = fetch("https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm");

export default {
	initWasmPromise: initWasm(resvgWasm),
	Resvg: _Resvg,
};
