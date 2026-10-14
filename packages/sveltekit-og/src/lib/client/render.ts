import type { Component } from "svelte";
import { ImageResponseError, ErrorCodes } from "../helpers/error-handler.js";
import { renderImage as coreRender, type Platform } from "../core/render.js";
import type { ClientImageResponseOptions } from "./types.js";

/**
 * Client platform: components are mounted in a detached shadow root (needs a
 * document, so not in workers), Satori's wasm and fallback fonts come from
 * bundler-emitted same-origin assets. All three are lazy imports.
 */
export const clientPlatform: Platform = {
	async componentToHtml(component, props) {
		if (typeof document === "undefined") {
			throw new ImageResponseError(
				"Svelte components can't be rendered in a worker (no document). Pass an HTML string instead.",
				ErrorCodes.COMPONENT_IN_WORKER
			);
		}
		// lazy: only main-thread component users download the mounter + Svelte's mount runtime
		const { componentToHtml } = await import("./component.js");
		return componentToHtml(component, props);
	},
	satori: {
		satori: () => import("./satori-wasm.js").then((m) => m.useSatori()),
		resvg: () => import("./satori-wasm.js").then((m) => m.useResvg()),
		fonts: () => import("./fonts.js").then((m) => m.defaultClientFonts()),
	},
};

/** Client-side render to bytes (svg → string). Defaults to Takumi. */
export function renderImage(
	element: string | Component<any>,
	options: ClientImageResponseOptions = {},
	props?: Record<string, unknown>
): Promise<Uint8Array | string> {
	return coreRender(element, options, props, clientPlatform);
}
