import type { Component, ComponentProps } from "svelte";
import type { ClientImageResponseOptions } from "./types.js";
import { clientPlatform } from "./render.js";
import { imageResponseInit } from "../core/render.js";
import { ImageResponseError, ErrorCodes } from "../helpers/error-handler.js";

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
		const { body, init } = imageResponseInit(element, options, props, clientPlatform);
		super(body, init);
	}

	/*
	 * Browsers turn an errored body stream into a bare `TypeError: Failed to fetch`
	 * when read through Response's own arrayBuffer()/blob()/text(), which drops the
	 * ImageResponseError (and its .code). Reading the stream directly keeps the
	 * original error, so override the three readers users actually call.
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
 * `error.code` (e.g. COMPONENT_IN_WORKER, FONT_LOAD_FAILED).
 * ponytail: unwrap here rather than change the shared helper; fold into the v3 realignment.
 */
function unwrapRenderError(error: unknown): unknown {
	return error instanceof ImageResponseError &&
		error.code === ErrorCodes.UNKNOWN_ERROR &&
		error.originalError instanceof ImageResponseError
		? error.originalError
		: error;
}
