import type _satori from "satori";
import type { SatoriOptions as SatoriLibOptions } from "satori";
import type { Resvg } from "@resvg/resvg-wasm";
import type { ResolvedFont, SatoriOptions } from "../types.js";
import type { VNode } from "../../types.js";
import { type EmojiType, loadDynamicAsset } from "../../helpers/emoji.js";
import { DEFAULT_WIDTH } from "../../helpers/defaults.js";
import { createLogger } from "../../helpers/logger.js";
import { handleAsync, handleSync, ErrorCodes } from "../../helpers/error-handler.js";

/*
 * Satori (+ ReSVG for png) engine, shared by server and client. The only runtime
 * difference is how the wasm gets loaded, so that comes in as `SatoriAssets` from
 * the server/client platform. Loaded lazily by core/render.ts so takumi-only apps
 * never evaluate it.
 */

/** How this runtime loads Satori's pieces. Each is memoized by the platform. */
export interface SatoriAssets {
	satori(): Promise<typeof _satori>;
	resvg(): Promise<typeof Resvg>;
	/** Fallback when the caller passes no fonts (Satori has none built in). */
	fonts(): Promise<ResolvedFont[]>;
}

export type SatoriEngineOptions = Omit<SatoriOptions, "fonts"> & { fonts: ResolvedFont[] };

/** VNode in, png bytes (or an svg string) out. */
export async function render(
	vnode: VNode,
	options: SatoriEngineOptions,
	assets: SatoriAssets
): Promise<Uint8Array | string> {
	const log = createLogger(options.debug ?? false);
	const satori = await handleAsync(
		() => assets.satori(),
		ErrorCodes.SATORI_INIT_FAILED,
		"Failed to initialize Satori"
	);

	// the whole options object goes through, as before: satori reads width/height/
	// fonts/tailwindConfig and draws layout boxes when `debug` is on
	const satoriOptions = {
		...options,
		loadAdditionalAsset: loadDynamicAsset({ emoji: options.emoji as EmojiType }),
	} as unknown as SatoriLibOptions;

	log.debug("Generating SVG with Satori");
	const svg = await handleAsync(
		() => satori(vnode, satoriOptions),
		ErrorCodes.SATORI_RENDER_FAILED,
		"Failed to render SVG with Satori"
	);
	if (options.format === "svg") return svg;

	const Resvg = await handleAsync(
		() => assets.resvg(),
		ErrorCodes.RESVG_INIT_FAILED,
		"Failed to initialize ReSVG"
	);

	log.debug("Rendering PNG with ReSVG");
	return handleSync(
		() => {
			const resvg = new Resvg(svg, {
				fitTo: { mode: "width", value: options.width || DEFAULT_WIDTH },
			});
			const rendered = resvg.render();
			// free the wasm-backed objects so long-lived isolates don't grow wasm memory
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
