import type { Component, ComponentProps } from "svelte";
import type { ClientImageResponseOptions } from "./types.js";
import { ImageResponse } from "./image-response.js";

/**
 * Same API as the client `ImageResponse`, as a plain function. Returns a
 * `Response` carrying the rendered image bytes.
 */
export function createImage<T extends string | Component<any>>(
	element: T,
	options?: ClientImageResponseOptions,
	props?: T extends Component<any> ? ComponentProps<T> : never
): Response {
	return new ImageResponse(element, options, props);
}
