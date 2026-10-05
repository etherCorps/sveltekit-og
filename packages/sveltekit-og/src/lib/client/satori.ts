import type { Component } from "svelte";
import type { SatoriOptions } from "satori";
import type { ResvgRenderOptions } from "@resvg/resvg-wasm";

import { type EmojiType, loadDynamicAsset } from "../helpers/emoji.js";
import { default_fonts, DEFAULT_WIDTH } from "../helpers/defaults.js";
import type { ComponentOptions, ImageOptions } from "../types.js";
import { createVNode } from "../helpers/toJSX.js";
import { createLogger } from "../helpers/logger.js";
import { handleAsync, ErrorCodes } from "../helpers/error-handler.js";
import { useSatori, useResvg } from "./providers.js";

// Browser twin of helpers/create.js: same Satori + ReSVG orchestration and shared
// (engine-agnostic) helpers, but the wasm instances come from the browser providers
// so the server render path stays untouched and free of browser wasm imports.

/** Single entry for the client Satori + ReSVG engine. */
export function createSatoriImage(
	element: string | Component<any>,
	imageOptions: ImageOptions,
	componentOptions?: ComponentOptions
): Promise<Uint8Array | string> {
	return imageOptions.format === "svg"
		? createSvg(element, imageOptions, componentOptions)
		: createPng(element, imageOptions, componentOptions);
}

async function createSvg(
	element: string | Component<any>,
	imageOptions: ImageOptions,
	componentOptions?: ComponentOptions
): Promise<string> {
	const log = createLogger(imageOptions.debug ?? false);
	const vnodes = createVNode(element, componentOptions);
	const satori = await useSatori();

	const satoriOptions = { ...imageOptions } as SatoriOptions;
	if (!satoriOptions.fonts) {
		satoriOptions.fonts = await handleAsync(
			() => default_fonts(),
			ErrorCodes.FONT_LOAD_FAILED,
			"Failed to load default fonts for Satori"
		);
	}

	satoriOptions.loadAdditionalAsset = loadDynamicAsset({
		emoji: imageOptions.emoji as EmojiType,
	}) as SatoriOptions["loadAdditionalAsset"];

	log.debug("Generating SVG with Satori (client)");

	return handleAsync(
		() => satori(vnodes, satoriOptions),
		ErrorCodes.SATORI_RENDER_FAILED,
		"Failed to render SVG with Satori"
	);
}

async function createPng(
	element: string | Component<any>,
	imageOptions: ImageOptions,
	componentOptions?: ComponentOptions
): Promise<Uint8Array> {
	const log = createLogger(imageOptions.debug ?? false);
	const svg = await handleAsync(
		() => createSvg(element, imageOptions, componentOptions),
		ErrorCodes.SATORI_RENDER_FAILED,
		"Failed to create SVG for PNG rendering"
	);

	const Resvg = await handleAsync(
		() => useResvg(),
		ErrorCodes.RESVG_INIT_FAILED,
		"Failed to initialize ReSVG"
	);

	const resvg_options: ResvgRenderOptions = {
		fitTo: { mode: "width", value: imageOptions.width || DEFAULT_WIDTH },
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
