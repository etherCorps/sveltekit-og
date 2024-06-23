import _satori from 'satori/wasm'
import initYoga from 'yoga-wasm-web'
import { init } from 'satori'

const wasm = import('yoga-wasm-web/dist/yoga.wasm?module')
  .then(async yoga => await initYoga(yoga.default || yoga))

export default {
  initWasmPromise: ((resolve) => {
    wasm.then((yoga) => {
      init(yoga)
      resolve()
    })
  }),
  satori: _satori,
}
