import type { Renderer as NodeRenderer, FontDetails } from "takumi-js/node";
import autoModule, { init as initTakumiWasm, Renderer } from "takumi-js/wasm";
import { handleAsync, ErrorCodes } from "../helpers/error-handler.js";

/** The WASM renderer; exposes `render`/`renderSvg`/`registerFont`. */
export type TakumiRenderer = NodeRenderer;

// Keep one renderer alive across requests (mirrors satori/resvg instance reuse
// and Takumi's own global renderer). Fonts registered on it accumulate, so we
// track which have already been registered to avoid duplicate work.
let rendererPromise: Promise<TakumiRenderer> | undefined;
const registeredFontKeys = new Set<string>();

async function initRenderer(): Promise<TakumiRenderer> {
	await handleAsync(
		async () => {
			// Mirror takumi-js's own wasm backend init. `@takumi-rs/wasm/auto`
			// (re-exported as the default of takumi-js/wasm) resolves the correct
			// wasm binary for the current runtime — workerd, edge-light, node, or a
			// bundler `?module`/`?url` — via package export conditions. So we reuse
			// the wasm that ships with takumi-js instead of vendoring a 4MB copy.
			const resolved = typeof autoModule === "function" ? await autoModule() : await autoModule;
			const input =
				resolved && typeof resolved === "object" && "default" in resolved
					? (resolved as { default: unknown }).default
					: resolved;
			await initTakumiWasm(input ? { module_or_path: input } : undefined);
		},
		ErrorCodes.TAKUMI_INIT_FAILED,
		"Failed to initialize Takumi WASM"
	);

	return new Renderer() as unknown as TakumiRenderer;
}

/** Lazily creates and caches the Takumi renderer for the current runtime. */
export async function useTakumiRenderer(_debug = false): Promise<TakumiRenderer> {
	rendererPromise ??= initRenderer();
	return rendererPromise;
}

/**
 * Registers each font on the renderer once. Keyed by name/weight/style so the
 * same face isn't re-registered across requests.
 */
export async function registerTakumiFonts(
	renderer: TakumiRenderer,
	fonts: FontDetails[]
): Promise<void> {
	for (const font of fonts) {
		const key = `${font.name ?? "unnamed"}-${font.weight ?? "auto"}-${font.style ?? "normal"}`;
		if (registeredFontKeys.has(key)) continue;
		await handleAsync(
			() => renderer.registerFont(font),
			ErrorCodes.FONT_LOAD_FAILED,
			`Failed to register Takumi font: ${key}`
		);
		registeredFontKeys.add(key);
	}
}
