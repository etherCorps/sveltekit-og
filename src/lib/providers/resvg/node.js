// import { Resvg as _Resvg } from '@resvg/resvg-js'
//
// export default {
// 	initWasmPromise: Promise.resolve(),
// 	Resvg: _Resvg,
// }

import { Resvg as _Resvg, initWasm } from '@resvg/resvg-wasm';

async function wasmModule() {
	const wasm = await fetch('https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm')
	const buffer = Buffer.from(wasm, 'utf8');
	console.log(typeof new WebAssembly.Module(buffer), 'wasmModule Type');
	return new WebAssembly.Module(buffer);
}

const resvgWasm = fetch('https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm')

export default {
	initWasmPromise: initWasm(resvgWasm),
	Resvg: _Resvg,
}
