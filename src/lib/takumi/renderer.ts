import type { Renderer as NodeRenderer, FontDetails } from "takumi-js/node";
import autoModule, { init as initTakumiWasm, Renderer } from "takumi-js/wasm";
import { handleAsync, ErrorCodes } from "../helpers/error-handler.js";

export type TakumiRenderer = NodeRenderer;

// keep one renderer alive across requests, same as the satori/resvg instances.
// fonts registered on it stick around, so we dedupe by key.
let rendererPromise: Promise<TakumiRenderer> | undefined;
const registeredFontKeys = new Set<string>();

async function initRenderer(): Promise<TakumiRenderer> {
	await handleAsync(
		async () => {
			// reuse the wasm that ships with takumi-js instead of vendoring our own.
			// @takumi-rs/wasm/auto picks the right binary per runtime (workerd, edge,
			// node, ?module) via export conditions. this is the same dance takumi-js
			// does internally.
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

/** Register each font once, keyed by name/weight/style. */
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
