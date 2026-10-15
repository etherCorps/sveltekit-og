import type { FontInput, ResolvedFont } from "./types.js";
import { handleAsync, ErrorCodes } from "../helpers/error-handler.js";

// GoogleFont/CustomFont expose `data` as a lazily-loading getter and raw descriptors
// hold bytes or a loader, so one shape check covers both without `instanceof`.
async function loadFont(font: FontInput): Promise<ResolvedFont> {
	const data = typeof font.data === "function" ? await font.data() : await font.data;
	return {
		name: font.name,
		data: data as ResolvedFont["data"],
		weight: font.weight as number | undefined,
		style: font.style,
	};
}

// Resolved once per font object within an isolate: a module-level `fonts: [...]` array,
// the common case, never re-runs its loaders (a GoogleFont fetch, a file read) on the
// next render. Keyed by identity, so a new object is a new font; a rejected load is
// dropped so the next render retries it.
const resolved = new WeakMap<FontInput, Promise<ResolvedFont>>();

function resolveFont(font: FontInput): Promise<ResolvedFont> {
	let p = resolved.get(font);
	if (!p) {
		p = loadFont(font).catch((error) => {
			resolved.delete(font);
			throw error;
		});
		resolved.set(font, p);
	}
	return p;
}

/** Load every font's bytes in parallel; a failure surfaces as FONT_LOAD_FAILED. */
export function resolveFontInputs(fonts: FontInput[]): Promise<ResolvedFont[]> {
	return handleAsync(
		() => Promise.all(fonts.map(resolveFont)),
		ErrorCodes.FONT_LOAD_FAILED,
		"Failed to resolve fonts"
	);
}
