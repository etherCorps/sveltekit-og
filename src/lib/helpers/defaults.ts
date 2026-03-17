import type { SatoriOptions } from "satori";

import type { ImageOptions } from "../types.js";
import type { EmojiType } from "./emoji.js";
import { handleAsyncAll, validateResponse, ErrorCodes } from "./error-handler.js";

export async function default_fonts(): Promise<SatoriOptions["fonts"]> {
	const [noto_sans_regular_font_resp, noto_sans_bold_font_reps] = await handleAsyncAll(
		[
			() => fetch("https://cdn-sveltekit-og.ethercorps.io/NotoSans-Regular.ttf"),
			() => fetch("https://cdn-sveltekit-og.ethercorps.io/NotoSans-Bold.ttf"),
		] as const,
		ErrorCodes.FONT_LOAD_FAILED,
		"Failed to fetch default fonts"
	);

	const [noto_sans_regular_font, noto_sans_bold_font] = await handleAsyncAll(
		[
			() =>
				validateResponse(
					noto_sans_regular_font_resp,
					ErrorCodes.FONT_LOAD_FAILED,
					"Failed to validate regular font response"
				),
			() =>
				validateResponse(
					noto_sans_bold_font_reps,
					ErrorCodes.FONT_LOAD_FAILED,
					"Failed to validate bold font response"
				),
		] as const,
		ErrorCodes.FONT_LOAD_FAILED,
		"Failed to process font responses"
	);

	return [
		{
			data: noto_sans_regular_font as ArrayBuffer,
			name: "Inter",
			weight: 400,
			style: "normal",
		},
		{
			data: noto_sans_bold_font as ArrayBuffer,
			name: "Inter",
			weight: 700,
			style: "normal",
		},
	];
}

export const DEFAULT_FORMAT = "png";
export const DEFAULT_WIDTH = 1200;
export const DEFAULT_HEIGHT = 630;
export const DEFAULT_EMOJI_PROVIDER: EmojiType = "twemoji";
export const DEFAULT_STATUS_CODE = 200;
export const DEFAULT_STATUS_TEXT = "Success";

export const DEFAULT_OPTIONS: ImageOptions = {
	height: DEFAULT_HEIGHT,
	width: DEFAULT_WIDTH,
	debug: false,
	format: DEFAULT_FORMAT,
	emoji: "twemoji",
};
