import { Resvg as _Resvg, initWasm } from '@resvg/resvg-wasm'

export default {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  initWasmPromise: initWasm(import('./resvg.wasm?module').then(r => r.default || r)),
  Resvg: _Resvg,
}
