import type { Component } from "svelte";
import { render as takumiRender, renderSvg } from "takumi-js";
import { useTakumiRenderer, registerTakumiFonts, type TakumiRenderer } from "./renderer.js";
import { resolveTakumiFonts } from "./fonts.js";
import type { TakumiImageOptions } from "./types.js";
import { createLogger } from "../helpers/logger.js";
import { handleAsync, ErrorCodes, handleSync } from "../helpers/error-handler.js";
import { createVNode } from "$lib/helpers/toJSX.js";

/** Render an HTML string or Svelte component to image bytes (or an svg string). */
export async function createTakumiImage(
	element: string | Component<any>,
	options: TakumiImageOptions,
	props?: Record<string, unknown>
): Promise<Uint8Array | string> {
	const log = createLogger(options.debug ?? false);

	const vNode = handleSync(
		() => createVNode(element, { props }),
		ErrorCodes.VNODE_CREATION_FAILED,
		"Failed to create HTML for Takumi"
	);

	const renderer = await useTakumiRenderer();

	if (options.fonts?.length) {
		const fonts = await resolveTakumiFonts(options.fonts);
		await registerTakumiFonts(renderer, fonts);
	}

	const { width, height, format = "png", quality, stylesheets, emoji } = options;
	const shared = { renderer: renderer as TakumiRenderer, width, height, stylesheets, emoji };

	log.debug(`Rendering ${format.toUpperCase()} with Takumi`);

	if (format === "svg") {
		return handleAsync(
			() => renderSvg(vNode, shared),
			ErrorCodes.TAKUMI_RENDER_FAILED,
			"Failed to render SVG with Takumi"
		);
	}

	return handleAsync(
		() => takumiRender(vNode, { ...shared, format, quality }),
		ErrorCodes.TAKUMI_RENDER_FAILED,
		"Failed to render image with Takumi"
	);
}
