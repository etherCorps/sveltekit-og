import type { Component, ComponentProps } from "svelte";
import type { TakumiImageResponseOptions } from "./types.js";
import { imageResponseInit } from "../core/render.js";
import { serverPlatform } from "../server/render.js";

/** OG image rendered by Takumi. Takes an HTML string or a Svelte component. */
export class ImageResponse<T extends string | Component<any>> extends Response {
	constructor(
		element: T,
		options?: TakumiImageResponseOptions,
		props?: T extends Component<any> ? ComponentProps<T> : never
	) {
		const { body, init } = imageResponseInit(
			element,
			{ ...options, engine: "takumi" },
			props,
			serverPlatform
		);
		super(body, init);
	}
}
