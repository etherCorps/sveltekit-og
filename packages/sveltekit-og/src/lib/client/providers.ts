import _satori, { init as initSatoriWasm } from "satori/standalone";
import { Resvg as _Resvg, initWasm as initResvgWasm } from "@resvg/resvg-wasm";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite resolves ?url to the emitted asset path
import yogaUrl from "satori/yoga.wasm?url";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite resolves ?url to the emitted asset path
import resvgWasmUrl from "@resvg/resvg-wasm/index_bg.wasm?url";

/*
 * Browser/worker wasm loaders for the Satori + ReSVG engine, injected into the
 * shared render code (helpers/create.js). The wasm is loaded from same-origin
 * bundler-emitted assets (Vite ?url + fetch(new URL(...))), so there's no CORS
 * and it works in browsers and workers alike. Kept out of the server providers
 * (providers/instances.js) so neither bundle pulls in the other's runtime.
 *
 * Each init is memoized; a rejected init clears the cache so the next call retries.
 */

let satoriPromise: Promise<typeof _satori> | undefined;
let resvgPromise: Promise<typeof _Resvg> | undefined;

export function useSatori(): Promise<typeof _satori> {
	satoriPromise ??= (async () => {
		const bytes = await fetch(new URL(yogaUrl, import.meta.url)).then((r) => r.arrayBuffer());
		await initSatoriWasm(await WebAssembly.compile(bytes));
		return _satori;
	})().catch((error) => {
		satoriPromise = undefined;
		throw error;
	});
	return satoriPromise;
}

export function useResvg(): Promise<typeof _Resvg> {
	resvgPromise ??= (async () => {
		await initResvgWasm(fetch(new URL(resvgWasmUrl, import.meta.url)));
		return _Resvg;
	})().catch((error) => {
		resvgPromise = undefined;
		throw error;
	});
	return resvgPromise;
}
