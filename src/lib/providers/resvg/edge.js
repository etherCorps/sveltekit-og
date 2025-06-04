import { Resvg as _Resvg, initWasm } from '@resvg/resvg-wasm'

export default {
  initWasmPromise: initWasm(import('./resvg.wasm?module').then(r => r.default || r)),
  Resvg: _Resvg,
}
