/**
 * Alias of the root entry: Takumi has been the default engine there since v5.
 * Kept so `@ethercorps/sveltekit-og/takumi` imports keep working; removed in v6.
 */
export * from "../index.js";

// v4 names for the takumi types, mapped onto the shared ones
export type {
	TakumiImageResponseOptions,
	TakumiImageOptions,
	TakumiResponseOptions,
	TakumiFormat,
} from "./types.js";
export type { TakumiFontInput, TakumiFontDescriptor } from "./fonts.js";
export { resolveTakumiFonts } from "./fonts.js";
