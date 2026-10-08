import type { SatoriOptions } from "satori";
import type { ResvgRenderOptions } from "@resvg/resvg-wasm";
import _satori, { init as initSatoriWasm } from "satori/standalone";
import { Resvg as _Resvg, initWasm as initResvgWasm } from "@resvg/resvg-wasm";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite resolves ?url to the emitted asset path
import yogaUrl from "satori/yoga.wasm?url";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite resolves ?url to the emitted asset path
import resvgWasmUrl from "@resvg/resvg-wasm/index_bg.wasm?url";

import { type EmojiType, loadDynamicAsset } from "../../helpers/emoji.js";
import { DEFAULT_WIDTH } from "../../helpers/defaults.js";
import type { ImageOptions } from "../../types.js";
import { createVNode } from "../../helpers/toJSX.js";
import { createLogger } from "../../helpers/logger.js";
import { handleAsync, ErrorCodes } from "../../helpers/error-handler.js";

/*
 * Browser/worker Satori + ReSVG engine. Loaded lazily by render.js so takumi users
 * never download it. The wasm comes from same-origin bundler-emitted assets
 * (Vite ?url + fetch(new URL(...))): no CORS, works in browsers and workers alike.
 * Kept out of the server providers so neither bundle pulls in the other's runtime.
 *
 * Each init is memoized; a rejected init clears the cache so the next call retries.
 */

let satoriPromise: Promise<typeof _satori> | undefined;
let resvgPromise: Promise<typeof _Resvg> | undefined;

function useSatori(): Promise<typeof _satori> {
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

function useResvg(): Promise<typeof _Resvg> {
	resvgPromise ??= (async () => {
		await initResvgWasm(fetch(new URL(resvgWasmUrl, import.meta.url)));
		return _Resvg;
	})().catch((error) => {
		resvgPromise = undefined;
		throw error;
	});
	return resvgPromise;
}

/** Engine entry: HTML string in, svg string or png bytes out. Fonts are required here —
 * render.js fills in the bundled defaults when the caller passes none. */
export function render(html: string, options: ImageOptions): Promise<Uint8Array | string> {
	return options.format === "svg" ? createSvg(html, options) : createPng(html, options);
}

async function createSvg(html: string, options: ImageOptions): Promise<string> {
	const log = createLogger(options.debug ?? false);
	const vnodes = createVNode(html);
	const satori = await handleAsync(
		() => useSatori(),
		ErrorCodes.SATORI_INIT_FAILED,
		"Failed to initialize Satori"
	);

	const satoriOptions = { ...options } as SatoriOptions;
	satoriOptions.loadAdditionalAsset = loadDynamicAsset({
		emoji: options.emoji as EmojiType,
	}) as SatoriOptions["loadAdditionalAsset"];

	log.debug("Generating SVG with Satori (client)");

	return handleAsync(
		() => satori(vnodes, satoriOptions),
		ErrorCodes.SATORI_RENDER_FAILED,
		"Failed to render SVG with Satori"
	);
}

async function createPng(html: string, options: ImageOptions): Promise<Uint8Array> {
	const log = createLogger(options.debug ?? false);
	const svg = await createSvg(html, options);

	const Resvg = await handleAsync(
		() => useResvg(),
		ErrorCodes.RESVG_INIT_FAILED,
		"Failed to initialize ReSVG"
	);

	const resvg_options: ResvgRenderOptions = {
		fitTo: { mode: "width", value: options.width || DEFAULT_WIDTH },
	};

	log.debug("Rendering PNG with ReSVG (client)");

	return handleAsync(
		async () => {
			// free the wasm-backed objects so repeated client renders don't grow wasm memory
			const resvg = new Resvg(svg, resvg_options);
			const rendered = resvg.render();
			try {
				return rendered.asPng();
			} finally {
				rendered.free();
				resvg.free();
			}
		},
		ErrorCodes.RESVG_RENDER_FAILED,
		"Failed to render PNG with ReSVG"
	);
}
