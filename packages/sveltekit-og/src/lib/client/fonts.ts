import type { Font } from "../types.js";
import { handleAsync, ErrorCodes } from "../helpers/error-handler.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite resolves ?url to the emitted asset path
import regularUrl from "./assets/NotoSans-Regular.ttf?url";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite resolves ?url to the emitted asset path
import boldUrl from "./assets/NotoSans-Bold.ttf?url";

/*
 * Bundled fallback fonts for the client satori engine. The server falls back to a
 * CDN that doesn't send CORS headers, so browsers can't use it; these ship with the
 * package and are served same-origin from the consumer's own build output.
 *
 * Loaded once and memoized; a rejected load clears the memo so the next render retries.
 * Takumi doesn't need this — its wasm embeds a sans-serif.
 */

let fontsPromise: Promise<Font[]> | undefined;

export function defaultClientFonts(): Promise<Font[]> {
	fontsPromise ??= load().catch((error) => {
		fontsPromise = undefined;
		throw error;
	});
	return fontsPromise;
}

async function fetchFont(url: string): Promise<ArrayBuffer> {
	const res = await fetch(new URL(url, import.meta.url));
	if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
	return res.arrayBuffer();
}

async function load(): Promise<Font[]> {
	const [regular, bold] = await handleAsync(
		() => Promise.all([fetchFont(regularUrl), fetchFont(boldUrl)]),
		ErrorCodes.FONT_LOAD_FAILED,
		"Failed to load the bundled default fonts"
	);
	return [
		{ name: "Noto Sans", data: regular, weight: 400, style: "normal" },
		{ name: "Noto Sans", data: bold, weight: 700, style: "normal" },
	];
}
