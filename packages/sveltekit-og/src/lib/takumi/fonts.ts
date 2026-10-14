import type { FontDetails } from "takumi-js/node";
import type { FontDescriptor, FontInput } from "../core/types.js";
import { resolveFontInputs } from "../core/fonts.js";

/** Takumi-native font descriptor; data is the bytes or a lazy loader, like takumi-js wants. */
export type TakumiFontDescriptor = FontDescriptor;

/** What the takumi path accepts: our GoogleFont/CustomFont, or a raw takumi descriptor. */
export type TakumiFontInput = FontInput;

/** Normalize mixed font inputs to FontDetails for registerFont, loaders run in parallel. */
export async function resolveTakumiFonts(fonts: TakumiFontInput[]): Promise<FontDetails[]> {
	return (await resolveFontInputs(fonts)) as FontDetails[];
}
