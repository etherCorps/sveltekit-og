import type { Component, ComponentProps } from "svelte";
import type { TakumiImageResponseOptions, TakumiFormat } from "./types.js";
import { createTakumiImage } from "./render.js";
import { createLogger } from "../helpers/logger.js";
import { handleAsync, ImageResponseError, ErrorCodes } from "../helpers/error-handler.js";
import { formatBytes } from "../helpers/utils.js";

const DEFAULT_OPTIONS = {
	width: 1200,
	height: 630,
	format: "png" as TakumiFormat,
	emoji: "twemoji" as const,
	debug: false,
};

const CONTENT_TYPES: Record<TakumiFormat, string> = {
	png: "image/png",
	jpeg: "image/jpeg",
	webp: "image/webp",
	ico: "image/x-icon",
	raw: "application/octet-stream",
	svg: "image/svg+xml",
};

/**
 * Generates an Open Graph image with the Takumi engine and returns it as a
 * `Response`. Accepts an HTML string or a Svelte component (with props).
 */
export class ImageResponse<T extends string | Component<any>> extends Response {
	constructor(
		element: T,
		options?: TakumiImageResponseOptions,
		props?: T extends Component<any> ? ComponentProps<T> : never
	) {
		const opts = { ...DEFAULT_OPTIONS, ...options };
		const log = createLogger(opts.debug);
		log.debug("Takumi ImageResponse created");

		const format = opts.format;
		const body = new ReadableStream({
			async start(controller) {
				try {
					const output = await handleAsync(
						() => createTakumiImage(element as string, opts, props),
						ErrorCodes.UNKNOWN_ERROR,
						`Failed to generate ${format.toUpperCase()}`
					);
					// renderSvg returns a string; raster formats return bytes. A
					// Response body stream must emit Uint8Array chunks.
					const bytes =
						typeof output === "string" ? new TextEncoder().encode(output) : output;
					log.info(`Generated ${format.toUpperCase()}: ${formatBytes(bytes.byteLength)}`);
					controller.enqueue(bytes);
					controller.close();
				} catch (error) {
					const err =
						error instanceof ImageResponseError
							? error
							: new ImageResponseError(
									error instanceof Error ? error.message : String(error),
									ErrorCodes.UNKNOWN_ERROR,
									error instanceof Error ? error : new Error(String(error))
								);
					log.error("Failed to create Takumi image response:", err.message);
					controller.error(err);
				}
			},
		});

		super(body, {
			headers: {
				"Content-Type": CONTENT_TYPES[format],
				"Cache-Control": opts.debug
					? "no-cache, no-store"
					: "public, immutable, no-transform, max-age=31536000",
				...opts.headers,
			},
			status: opts.status || 200,
			statusText: opts.statusText || "Success",
		});
	}
}
