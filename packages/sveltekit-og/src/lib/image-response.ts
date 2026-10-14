import type { ImageResponseOptions } from "./types.js";
import type { Element, PropsArg } from "./core/types.js";
import { imageResponseInit } from "./core/render.js";
import { serverPlatform } from "./server/render.js";

export class ImageResponse<T extends Element> extends Response {
	constructor(element: T, options?: ImageResponseOptions, ...[props]: PropsArg<T>) {
		const { body, init } = imageResponseInit(
			element,
			{ ...options, engine: "satori" },
			props,
			serverPlatform
		);
		super(body, init);
	}
}
