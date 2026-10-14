import type { TakumiImageResponseOptions } from "./types.js";
import type { Element, PropsArg } from "../core/types.js";
import { imageResponseInit } from "../core/render.js";
import { serverPlatform } from "../server/render.js";

/** OG image rendered by Takumi. Takes an HTML string or a Svelte component. */
export class ImageResponse<T extends Element> extends Response {
	constructor(element: T, options?: TakumiImageResponseOptions, ...[props]: PropsArg<T>) {
		const { body, init } = imageResponseInit(
			element,
			{ ...options, engine: "takumi" },
			props,
			serverPlatform
		);
		super(body, init);
	}
}
