import type { FontDetails } from "takumi-js/node";
import { BaseFont } from "../fonts.js";
import type { MayBePromise } from "../types.js";
import { handleAsync, ErrorCodes } from "../helpers/error-handler.js";

type ByteBuf = Uint8Array | ArrayBuffer | Buffer;

/** Takumi-native font descriptor; data is the bytes or a lazy loader, like takumi-js wants. */
export interface TakumiFontDescriptor {
	name?: string;
	data: ByteBuf | (() => MayBePromise<ByteBuf>);
	weight?: number;
	style?: FontDetails["style"];
}

/** What the takumi path accepts: our GoogleFont/CustomFont, or a raw takumi descriptor. */
export type TakumiFontInput = BaseFont | TakumiFontDescriptor;

async function normalizeFont(font: TakumiFontInput): Promise<FontDetails> {
	if (font instanceof BaseFont) {
		// our font classes lazily load + cache through the data getter
		const data = (await font.data) as ByteBuf;
		return { name: font.name, data, weight: font.weight as number, style: font.style };
	}

	const data = typeof font.data === "function" ? await font.data() : await font.data;
	return { name: font.name, data, weight: font.weight, style: font.style };
}

/** Normalize mixed font inputs to FontDetails for registerFont, loaders run in parallel. */
export async function resolveTakumiFonts(fonts: TakumiFontInput[]): Promise<FontDetails[]> {
	return handleAsync(
		() => Promise.all(fonts.map(normalizeFont)),
		ErrorCodes.FONT_LOAD_FAILED,
		"Failed to resolve fonts for Takumi"
	);
}
