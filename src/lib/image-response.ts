import type { Component, ComponentProps } from "svelte";
import type { ImageResponseOptions } from "./types.js";
import { DEFAULT_OPTIONS } from "./helpers/defaults.js";
import { createPng, createSvg } from "./helpers/create.js";
import { buildImageResponse } from "./helpers/response.js";

export class ImageResponse<T extends string | Component<any>> extends Response {
	constructor(
		element: T,
		options?: ImageResponseOptions,
		props?: T extends Component<any> ? ComponentProps<T> : never
	) {
		const opts = Object.assign({ ...DEFAULT_OPTIONS }, options);
		const format = opts.format ?? "png";
		const createImage = format === "png" ? createPng : createSvg;

		const { body, init } = buildImageResponse(
			() => createImage(element as string, opts, { props }) as Promise<Uint8Array | string>,
			{
				label: format.toUpperCase(),
				contentType: `image/${format}${format === "svg" ? "+xml" : ""}`,
				debug: opts.debug ?? false,
				headers: opts.headers,
				status: opts.status,
				statusText: opts.statusText,
			}
		);

		super(body, init);
	}
}
