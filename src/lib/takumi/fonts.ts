import type { FontDetails } from "takumi-js/node";
import { BaseFont } from "../fonts.js";
import type { MayBePromise } from "../types.js";
import { handleAsync, ErrorCodes } from "../helpers/error-handler.js";

/** Font bytes Takumi accepts for registration. */
type ByteBuf = Uint8Array | ArrayBuffer | Buffer;

/**
 * A Takumi-native font descriptor. `data` may be the bytes directly or a lazy
 * loader returning them — matching `takumi-js`'s own font option shape.
 */
export interface TakumiFontDescriptor {
	name?: string;
	data: ByteBuf | (() => MayBePromise<ByteBuf>);
	weight?: number;
	style?: FontDetails["style"];
}

/**
 * Accepted font inputs on the Takumi path: this library's `GoogleFont` /
 * `CustomFont` helpers (any `BaseFont`) or a raw Takumi descriptor.
 */
export type TakumiFontInput = BaseFont | TakumiFontDescriptor;

async function normalizeFont(font: TakumiFontInput): Promise<FontDetails> {
	if (font instanceof BaseFont) {
		// GoogleFont/CustomFont: the `data` getter lazily loads (and caches) bytes.
		const data = (await font.data) as ByteBuf;
		return { name: font.name, data, weight: font.weight as number, style: font.style };
	}

	const data = typeof font.data === "function" ? await font.data() : await font.data;
	return { name: font.name, data, weight: font.weight, style: font.style };
}

/**
 * Resolves mixed font inputs into Takumi `FontDetails` ready for
 * `renderer.registerFont`. Loaders run in parallel.
 */
export async function resolveTakumiFonts(fonts: TakumiFontInput[]): Promise<FontDetails[]> {
	return handleAsync(
		() => Promise.all(fonts.map(normalizeFont)),
		ErrorCodes.FONT_LOAD_FAILED,
		"Failed to resolve fonts for Takumi"
	);
}
