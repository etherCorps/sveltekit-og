import type { Component, ComponentProps } from "svelte";
import type { ImageResponseOptions } from "./types.js";
import { DEFAULT_OPTIONS } from "./helpers/defaults.js";
import { createImage } from "./helpers/create.js";
import { buildImageResponse, CONTENT_TYPES } from "./helpers/response.js";

export class ImageResponse<T extends string | Component<any>> extends Response {
	constructor(
		element: T,
		options?: ImageResponseOptions,
		props?: T extends Component<any> ? ComponentProps<T> : never
	) {
		const opts = { ...DEFAULT_OPTIONS, ...options };
		const format = opts.format ?? "png";

		const { body, init } = buildImageResponse(
			() => createImage(element, { ...opts, format }, { props }),
			{
				label: format.toUpperCase(),
				contentType: CONTENT_TYPES[format],
				debug: opts.debug ?? false,
				headers: opts.headers,
				status: opts.status,
				statusText: opts.statusText,
			}
		);

		super(body, init);
	}
}
