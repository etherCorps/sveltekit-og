import type { Component, ComponentProps } from "svelte";
import type { ImageResponseOptions } from "./types.js";
import { imageResponseInit } from "./core/render.js";
import { serverPlatform } from "./server/render.js";

export class ImageResponse<T extends string | Component<any>> extends Response {
	constructor(
		element: T,
		options?: ImageResponseOptions,
		props?: T extends Component<any> ? ComponentProps<T> : never
	) {
		const { body, init } = imageResponseInit(
			element,
			{ ...options, engine: "satori" },
			props,
			serverPlatform
		);
		super(body, init);
	}
}
