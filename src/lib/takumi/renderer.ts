import type { Renderer as NodeRenderer, FontDetails } from "takumi-js/node";
import { isEdgeLight, isWorkerd } from "std-env";
import { createLogger } from "../helpers/logger.js";
import { handleAsync, ErrorCodes } from "../helpers/error-handler.js";

/** Either backend's Renderer; both expose `render`/`renderSvg`/`registerFont`. */
export type TakumiRenderer = NodeRenderer;

// Keep one renderer alive across requests (mirrors satori/resvg instance reuse
// and Takumi's own global renderer). Fonts registered on it accumulate, so we
// track which have already been registered to avoid duplicate work.
let rendererPromise: Promise<TakumiRenderer> | undefined;
const registeredFontKeys = new Set<string>();

async function initRenderer(debug: boolean): Promise<TakumiRenderer> {
	const log = createLogger(debug);
	const isWorkerLikeRuntime = isEdgeLight || isWorkerd;
	log.info(`Detected runtime: ${isWorkerLikeRuntime ? "Edge Light or Workerd" : "Node.js"}`);

	// Keep the imports as direct ternary expressions so the bundler can statically
	// emit the wasm chunk for the edge build (see providers/takumi/edge.js).
	const moduleImport = isWorkerLikeRuntime
		? import("../providers/takumi/edge.js")
		: import("../providers/takumi/node.js");

	const provider = (await handleAsync(
		() => moduleImport.then((m) => m.default),
		ErrorCodes.TAKUMI_INIT_FAILED,
		"Failed to import Takumi renderer module"
	)) as { initWasmPromise: Promise<unknown>; Renderer: new () => TakumiRenderer };

	await handleAsync(
		() => provider.initWasmPromise,
		ErrorCodes.TAKUMI_INIT_FAILED,
		"Failed to initialize Takumi WASM"
	);

	return new provider.Renderer();
}

/** Lazily creates and caches the Takumi renderer for the current runtime. */
export async function useTakumiRenderer(debug = false): Promise<TakumiRenderer> {
	rendererPromise ??= initRenderer(debug);
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
