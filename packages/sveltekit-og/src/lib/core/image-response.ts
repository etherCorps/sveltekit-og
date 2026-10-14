import type { Element, ImageResponseOptions } from "./types.js";
import { imageResponseInit, type Platform } from "./render.js";
import { ImageResponseError, ErrorCodes } from "../helpers/error-handler.js";

/**
 * A `Response` whose body is the rendered image. The server and client entries
 * subclass this with their platform; everything else is shared.
 */
export class ImageResponse<T extends Element> extends Response {
	constructor(
		platform: Platform,
		element: T,
		options: ImageResponseOptions | undefined,
		props: Record<string, unknown> | undefined
	) {
		const { body, init } = imageResponseInit(element, options, props, platform);
		super(body, init);
	}

	/*
	 * Browsers turn an errored body stream into a bare `TypeError: Failed to fetch`
	 * when read through Response's own arrayBuffer()/blob()/text(), which drops the
	 * ImageResponseError (and its .code). Reading the stream directly keeps the
	 * original error, so override the three readers users actually call. The same
	 * path on the server means every runtime surfaces the same error codes.
	 */
	override async arrayBuffer(): Promise<ArrayBuffer> {
		const reader = this.body!.getReader();
		const chunks: Uint8Array[] = [];
		let size = 0;
		for (;;) {
			let step: ReadableStreamReadResult<Uint8Array>;
			try {
				step = await reader.read();
			} catch (error) {
				throw unwrapRenderError(error);
			}
			if (step.done) break;
			chunks.push(step.value);
			size += step.value.byteLength;
		}
		const out = new Uint8Array(size);
		let offset = 0;
		for (const chunk of chunks) {
			out.set(chunk, offset);
			offset += chunk.byteLength;
		}
		return out.buffer;
	}

	override async blob(): Promise<Blob> {
		return new Blob([await this.arrayBuffer()], {
			type: this.headers.get("Content-Type") ?? "",
		});
	}

	override async text(): Promise<string> {
		return new TextDecoder().decode(await this.arrayBuffer());
	}
}

/**
 * The shared body builder wraps every failure as UNKNOWN_ERROR "Failed to generate X"
 * with the real error in `originalError`. Surface the inner one so callers can check
 * `error.code` (e.g. UNSUPPORTED_FORMAT, FONT_LOAD_FAILED).
 */
function unwrapRenderError(error: unknown): unknown {
	return error instanceof ImageResponseError &&
		error.code === ErrorCodes.UNKNOWN_ERROR &&
		error.originalError instanceof ImageResponseError
		? error.originalError
		: error;
}
