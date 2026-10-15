import type { Component } from "svelte";
import { render } from "svelte/server";
import type { Element, ImageResponseOptions, PropsArg } from "../core/types.js";
import { renderImage as coreRender, type Platform } from "../core/render.js";
import { ImageResponse as CoreImageResponse } from "../core/image-response.js";
import { default_fonts } from "../helpers/defaults.js";
import { handleSync, ErrorCodes } from "../helpers/error-handler.js";

/**
 * Server platform: components go through `svelte/server`, Satori's wasm through the
 * node/edge providers, and Satori's fallback fonts come from the CDN.
 */
export const serverPlatform: Platform = {
	componentToHtml(component, props) {
		const { body, head } = handleSync(
			// props were typed against this component at the public API (PropsOf<T>)
			() => render(component as Component<Record<string, unknown>>, { props }),
			ErrorCodes.VNODE_CREATION_FAILED,
			"Failed to render Svelte component to HTML"
		);
		// satori's CSS value parsers (e.g. linear-gradient) reject any line break or tab
		// inside a value, and `css="injected"` emits the component's <style> verbatim into
		// head — collapse its whitespace.
		return body.replaceAll("\n", "") + head.replace(/\s+/g, " ");
	},
	satori: {
		// lazy so takumi-only apps never evaluate the satori providers
		satori: () => import("../providers/instances.js").then((m) => m.useSatori()),
		resvg: () => import("../providers/instances.js").then((m) => m.useResvg()),
		fonts: default_fonts,
	},
};

/**
 * OG image as a `Response`, rendered on the server. Takes an HTML string or a Svelte
 * component; `options.engine` picks Takumi (default) or Satori.
 */
export class ImageResponse<T extends Element> extends CoreImageResponse<T> {
	constructor(element: T, options?: ImageResponseOptions, ...[props]: PropsArg<T>) {
		super(serverPlatform, element, options, props);
	}
}

/** Same as `new ImageResponse(...)`, as a function. */
export function createImage<T extends Element>(
	element: T,
	options?: ImageResponseOptions,
	...props: PropsArg<T>
): ImageResponse<T> {
	return new ImageResponse(element, options, ...props);
}

/** Render to bytes (`svg` → string) instead of a `Response`. */
export function renderImage<T extends Element>(
	element: T,
	options?: ImageResponseOptions,
	...[props]: PropsArg<T>
): Promise<Uint8Array | string> {
	return coreRender(element, options ?? {}, props, serverPlatform);
}
