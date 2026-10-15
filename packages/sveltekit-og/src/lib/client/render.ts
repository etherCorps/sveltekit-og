import type { Element, ImageResponseOptions, PropsArg } from "../core/types.js";
import { ImageResponseError, ErrorCodes } from "../helpers/error-handler.js";
import { renderImage as coreRender, type Platform } from "../core/render.js";
import { ImageResponse as CoreImageResponse } from "../core/image-response.js";

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

/**
 * OG image as a `Response`, rendered in the browser (or a worker) with the engine
 * picked by `options.engine` (Takumi by default). Consume it with
 * `URL.createObjectURL(await res.blob())`.
 */
export class ImageResponse<T extends Element> extends CoreImageResponse<T> {
	constructor(element: T, options?: ImageResponseOptions, ...[props]: PropsArg<T>) {
		super(clientPlatform, element, options, props);
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
	return coreRender(element, options ?? {}, props, clientPlatform);
}
