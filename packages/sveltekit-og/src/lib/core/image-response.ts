import type { Element, ImageResponseOptions } from "./types.js";
import { imageResponseInit, type Platform } from "./render.js";

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
	 * original error, so override the three readers users actually call.
	 */
	override async arrayBuffer(): Promise<ArrayBuffer> {
		const reader = this.body!.getReader();
		const chunks: Uint8Array[] = [];
		let size = 0;
		for (;;) {
			const step = await reader.read();
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
