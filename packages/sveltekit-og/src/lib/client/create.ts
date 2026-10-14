import type { ClientImageResponseOptions } from "./types.js";
import type { Element, PropsArg } from "../core/types.js";
import { ImageResponse } from "./image-response.js";

/**
 * Same API as the client `ImageResponse`, as a plain function. Returns a
 * `Response` carrying the rendered image bytes.
 */
export function createImage<T extends Element>(
	element: T,
	options?: ClientImageResponseOptions,
	...props: PropsArg<T>
): Response {
	return new ImageResponse(element, options, ...props);
}
