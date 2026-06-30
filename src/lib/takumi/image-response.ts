import type { Component, ComponentProps } from "svelte";
import type { TakumiImageResponseOptions, TakumiFormat } from "./types.js";
import { createTakumiImage } from "./render.js";
import { buildImageResponse } from "../helpers/response.js";

const DEFAULT_OPTIONS = {
	width: 1200,
	height: 630,
	format: "png" as TakumiFormat,
	emoji: "twemoji" as const,
	debug: false,
};

// takumi can also encode jpeg/webp/ico/raw, plus svg as text
const CONTENT_TYPES: Record<TakumiFormat, string> = {
	png: "image/png",
	jpeg: "image/jpeg",
	webp: "image/webp",
	ico: "image/x-icon",
	raw: "application/octet-stream",
	svg: "image/svg+xml",
};

/** OG image rendered by Takumi. Takes an HTML string or a Svelte component. */
export class ImageResponse<T extends string | Component<any>> extends Response {
	constructor(
		element: T,
		options?: TakumiImageResponseOptions,
		props?: T extends Component<any> ? ComponentProps<T> : never
	) {
		const opts = { ...DEFAULT_OPTIONS, ...options };

		const { body, init } = buildImageResponse(() => createTakumiImage(element as string, opts, props), {
			label: opts.format.toUpperCase(),
			contentType: CONTENT_TYPES[opts.format],
			debug: opts.debug,
			headers: opts.headers,
			status: opts.status,
			statusText: opts.statusText,
		});

		super(body, init);
	}
}
