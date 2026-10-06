import { createTakumiImage } from "../../takumi/render.js";
import type { TakumiImageOptions } from "../../takumi/types.js";

/**
 * Takumi engine boundary for the client. Exists only so render.js can `import()` it
 * lazily (own Vite chunk); the actual render is the shared takumi path. Takumi's wasm
 * embeds a sans-serif font, so no default fonts are injected here.
 */
export function render(html: string, options: TakumiImageOptions): Promise<Uint8Array | string> {
	return createTakumiImage(html, options);
}
