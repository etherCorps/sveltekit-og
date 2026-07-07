import { Resvg as _Resvg, initWasm } from "@resvg/resvg-wasm";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

// prefer reading resvg's wasm straight from the installed dependency (no
// network). some serverless bundlers (vercel/netlify via nft) don't trace the
// sibling .wasm onto disk, so fall back to fetching it there. either way we hand
// initWasm raw bytes / a Response — never a `?module` import, which node
// serverless can't instantiate. runs once when this module first loads.
async function loadResvgWasm() {
	try {
		const require = createRequire(import.meta.url);
		return await readFile(require.resolve("@resvg/resvg-wasm/index_bg.wasm"));
	} catch {
		return fetch("https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm");
	}
}

export default {
	initWasmPromise: initWasm(loadResvgWasm()),
	Resvg: _Resvg,
};
