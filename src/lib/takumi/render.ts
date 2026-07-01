import type { Component } from "svelte";
import { render as takumiRender, renderSvg, type ReactElementLike } from "takumi-js";
import { renderComponentToHtml } from "../helpers/to-html.js";
import { useTakumiRenderer, registerTakumiFonts, type TakumiRenderer } from "./renderer.js";
import { resolveTakumiFonts } from "./fonts.js";
import type { TakumiImageOptions } from "./types.js";
import { createLogger } from "../helpers/logger.js";
import { handleAsync, handleSync, ErrorCodes } from "../helpers/error-handler.js";
import { html } from "satori-html";

function elementToHtml(
	element: string | Component,
	props?: Record<string, unknown>
): string | ReactElementLike {
	if (typeof element === "string") return html(element.replaceAll("\n", "").trim());
	// head carries css injected via <svelte:options css="injected" />, so it goes first
	const { head, body } = renderComponentToHtml(element, props);
	return html(head + body);
}

/** Render an HTML string or Svelte component to image bytes (or an svg string). */
export async function createTakumiImage(
	element: string | Component,
	options: TakumiImageOptions,
	props?: Record<string, unknown>
): Promise<Uint8Array | string> {
	const log = createLogger(options.debug ?? false);

	const html = handleSync(
		() => elementToHtml(element, props),
		ErrorCodes.VNODE_CREATION_FAILED,
		"Failed to create HTML for Takumi"
	);

	const renderer = await useTakumiRenderer(options.debug);

	if (options.fonts?.length) {
		const fonts = await resolveTakumiFonts(options.fonts);
		await registerTakumiFonts(renderer, fonts);
	}

	const { width, height, format = "png", quality, stylesheets, emoji } = options;
	const shared = { renderer: renderer as TakumiRenderer, width, height, stylesheets, emoji };

	log.debug(`Rendering ${format.toUpperCase()} with Takumi`);

	if (format === "svg") {
		return handleAsync(
			() => renderSvg(html, shared),
			ErrorCodes.TAKUMI_RENDER_FAILED,
			"Failed to render SVG with Takumi"
		);
	}

	return handleAsync(
		() => takumiRender(html, { ...shared, format, quality }),
		ErrorCodes.TAKUMI_RENDER_FAILED,
		"Failed to render image with Takumi"
	);
}
