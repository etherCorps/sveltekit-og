import type { Component, ComponentProps } from "svelte";
import type { ClientImageResponseOptions } from "./types.js";
import { createClientImage } from "./render.js";
import { buildImageResponse, CONTENT_TYPES } from "../helpers/response.js";
import { ImageResponseError, ErrorCodes } from "../helpers/error-handler.js";
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
		return new Blob([await this.arrayBuffer()], { type: this.headers.get("Content-Type") ?? "" });
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
