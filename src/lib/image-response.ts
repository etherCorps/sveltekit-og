import type { Component, ComponentProps } from "svelte";
import type { ImageResponseOptions } from "./types.js";
import { DEFAULT_OPTIONS, DEFAULT_STATUS_CODE, DEFAULT_STATUS_TEXT } from "./helpers/defaults.js";
import { createPng, createSvg } from "./helpers/create.js";
import { isDebugEnabled, logger, withDebug } from "./helpers/logger.js";
import { handleAsync, ImageResponseError, ErrorCodes } from "./helpers/error-handler.js";
import { formatBytes } from "$lib/helpers/utils.js";

export class ImageResponse<T extends string | Component<any>> extends Response {
	constructor(
		element: T,
		options?: ImageResponseOptions,
		props?: T extends Component<any> ? ComponentProps<T> : never
	) {
		const extended_options = Object.assign({ ...DEFAULT_OPTIONS }, options);
		const isDebug = extended_options.debug ?? false;
		logger.debug("Debug mode", isDebugEnabled());
		const create_image_function = extended_options.format === "png" ? createPng : createSvg;
		const body = new ReadableStream({
			async start(controller) {
				return withDebug(isDebug, async () => {
					try {
						const buffer = (await handleAsync(
							() =>
								create_image_function(element as string, extended_options, {
									props,
								}) as Promise<unknown>,
							ErrorCodes.UNKNOWN_ERROR,
							`Failed to generate ${extended_options.format?.toUpperCase()}`
						)) as Uint8Array | string;
						logger.debug(buffer.length.toLocaleString())
						logger.info(
							`Generated ${extended_options!.format!.toUpperCase()}: ${formatBytes(buffer.length)}`
						);
						controller.enqueue(buffer);
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
						logger.error("Failed to create image response:", err.message);
						controller.error(err);
					}
				})

			},
		});

		super(body, {
			headers: {
				"Content-Type": `image/${extended_options.format}${extended_options.format === "svg" ? "+xml" : ""}`,
				"Cache-Control": extended_options.debug
					? "no-cache, no-store"
					: "public, immutable, no-transform, max-age=31536000",
				...extended_options.headers,
			},
			status: extended_options.status || DEFAULT_STATUS_CODE,
			statusText: extended_options.statusText || DEFAULT_STATUS_TEXT,
		});
	}
}
