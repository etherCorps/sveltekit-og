import type { Component, ComponentProps } from "svelte";
import type { ClientImageResponseOptions } from "./types.js";
import { createClientImage } from "./render.js";
import { buildImageResponse, CONTENT_TYPES } from "../helpers/response.js";
import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from "../helpers/defaults.js";

const DEFAULT_OPTIONS = {
	engine: "takumi" as const,
	width: DEFAULT_WIDTH,
	height: DEFAULT_HEIGHT,
	format: "png" as const,
	emoji: "twemoji" as const,
	debug: false,
};

/**
 * Client-side OG image, rendered in the browser (or a worker) with the engine
 * you pick via `options.engine` ("takumi" | "satori", defaults to "takumi").
 * Extends `Response`, so consume it with `URL.createObjectURL(await res.blob())`.
 */
export class ImageResponse<T extends string | Component<any>> extends Response {
	constructor(
		element: T,
		options?: ClientImageResponseOptions,
		props?: T extends Component<any> ? ComponentProps<T> : never
	) {
		const merged = { ...DEFAULT_OPTIONS, ...options };
		const engine = (merged.engine ?? "takumi") as "takumi" | "satori";
		// Satori only emits png or svg; any other raster format renders as png, so pin it
		// to png here too — otherwise the Content-Type would mislabel png bytes (e.g. webp).
		const format = (
			engine === "satori" && merged.format !== "svg" ? "png" : (merged.format ?? "png")
		) as keyof typeof CONTENT_TYPES;
		const opts = { ...merged, format } as ClientImageResponseOptions;
		// response-only fields live on both engine option shapes; read them off the raw input
		const resp = (options ?? {}) as {
			headers?: Record<string, string>;
			status?: number;
			statusText?: string;
		};

		const { body, init } = buildImageResponse(() => createClientImage(element, opts, props), {
			label: format.toUpperCase(),
			contentType: CONTENT_TYPES[format],
			debug: merged.debug ?? false,
			headers: resp.headers,
			status: resp.status,
			statusText: resp.statusText,
		});

		super(body, init);
	}
}
