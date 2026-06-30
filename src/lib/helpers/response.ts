import { createLogger } from "./logger.js";
import { handleAsync, toImageResponseError, ErrorCodes } from "./error-handler.js";
import { formatBytes } from "./utils.js";

// produces the final image; svg renders a string, raster formats give bytes
type ImageProducer = () => Promise<Uint8Array | string>;

interface BuildOptions {
	/** uppercased format, used in logs e.g. "PNG" */
	label: string;
	contentType: string;
	debug: boolean;
	headers?: Record<string, string>;
	status?: number;
	statusText?: string;
}

/**
 * Shared body + response init for both engines' ImageResponse. Streams the image
 * out as bytes (a Response stream can't take a raw string), with consistent
 * cache headers and error handling.
 */
export function buildImageResponse(
	produce: ImageProducer,
	opts: BuildOptions
): { body: ReadableStream; init: ResponseInit } {
	const log = createLogger(opts.debug);

	const body = new ReadableStream({
		async start(controller) {
			try {
				const out = await handleAsync(
					produce,
					ErrorCodes.UNKNOWN_ERROR,
					`Failed to generate ${opts.label}`
				);
				const bytes = typeof out === "string" ? new TextEncoder().encode(out) : out;
				log.info(`Generated ${opts.label}: ${formatBytes(bytes.byteLength)}`);
				controller.enqueue(bytes);
				controller.close();
			} catch (error) {
				const err = toImageResponseError(error);
				log.error("Failed to create image response:", err.message);
				controller.error(err);
			}
		},
	});

	const init: ResponseInit = {
		headers: {
			"Content-Type": opts.contentType,
			"Cache-Control": opts.debug
				? "no-cache, no-store"
				: "public, immutable, no-transform, max-age=31536000",
			...opts.headers,
		},
		status: opts.status || 200,
		statusText: opts.statusText || "Success",
	};

	return { body, init };
}
