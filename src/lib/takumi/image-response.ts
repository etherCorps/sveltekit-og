import type { Component, ComponentProps } from "svelte";
import type { TakumiImageResponseOptions, TakumiFormat } from "./types.js";
import { createTakumiImage } from "./render.js";
import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from "../helpers/defaults.js";
import { buildImageResponse, CONTENT_TYPES as SHARED_CONTENT_TYPES } from "../helpers/response.js";

const DEFAULT_OPTIONS = {
	width: DEFAULT_WIDTH,
	height: DEFAULT_HEIGHT,
	format: "png" as TakumiFormat,
	emoji: "twemoji" as const,
	debug: false,
};

// Verifies the shared map covers every takumi format
const CONTENT_TYPES: Record<TakumiFormat, string> = SHARED_CONTENT_TYPES;

/** OG image rendered by Takumi. Takes an HTML string or a Svelte component. */
export class ImageResponse<T extends string | Component<any>> extends Response {
	constructor(
		element: T,
		options?: TakumiImageResponseOptions,
		props?: T extends Component<any> ? ComponentProps<T> : never
	) {
		const opts = { ...DEFAULT_OPTIONS, ...options };

		const { body, init } = buildImageResponse(
			() => createTakumiImage(element as string, opts, props),
			{
				label: opts.format.toUpperCase(),
				contentType: CONTENT_TYPES[opts.format],
				debug: opts.debug,
				headers: opts.headers,
				status: opts.status,
				statusText: opts.statusText,
			}
		);

		super(body, init);
	}
}
