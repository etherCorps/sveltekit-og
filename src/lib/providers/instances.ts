import type { Resvg } from '@resvg/resvg-wasm'
import type _satori from 'satori'

// we keep instances alive to avoid re-importing them on every request, maybe not needed but
// also helps with type inference
// Code from vue-og-images
const resvgInstance: { instance?: { initWasmPromise: Promise<void>, Resvg: typeof Resvg } } = { instance: undefined }
const satoriInstance: { instance?: { initWasmPromise: Promise<void>, satori: typeof _satori } } = { instance: undefined }

export async function useResvg() {
	resvgInstance.instance = resvgInstance.instance || await import(`./resvg/wasm.js`).then(m => m.default)
	await resvgInstance.instance!.initWasmPromise
	return resvgInstance.instance!.Resvg
}

export async function useSatori(biding: string) {
	satoriInstance.instance = satoriInstance.instance || await import(`./satori/node.js`).then(m => m.default)
	await satoriInstance.instance!.initWasmPromise
	return satoriInstance.instance!.satori
}
