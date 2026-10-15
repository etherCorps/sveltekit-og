import _satori, { init as initSatoriWasm } from "satori/standalone";
import { Resvg as _Resvg, initWasm as initResvgWasm } from "@resvg/resvg-wasm";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite resolves ?url to the emitted asset path
import yogaUrl from "satori/yoga.wasm?url";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite resolves ?url to the emitted asset path
import resvgWasmUrl from "@resvg/resvg-wasm/index_bg.wasm?url";

/*
 * Browser/worker wasm for Satori + ReSVG. Loaded lazily by the client platform so
 * takumi users never download it. The wasm comes from same-origin bundler-emitted
 * assets (Vite ?url + fetch(new URL(...))): no CORS, works in browsers and workers alike.
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
