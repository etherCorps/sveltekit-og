import { render as takumiRender, renderSvg } from "takumi-js";
import type { Renderer, FontDetails } from "takumi-js/node";
import autoModule, { init as initTakumiWasm, Renderer as WasmRenderer } from "takumi-js/wasm";
import type { ResolvedFont, TakumiOptions } from "../types.js";
import type { VNode } from "../../types.js";
import { createLogger } from "../../helpers/logger.js";
import { handleAsync, ErrorCodes } from "../../helpers/error-handler.js";

/*
 * Takumi engine, shared by server and client: the same wasm build runs everywhere
 * (@takumi-rs/wasm/auto picks the binary per runtime via export conditions).
 * Loaded lazily by core/render.ts so satori-only apps never evaluate it.
 */

// one renderer per isolate; fonts registered on it persist, so dedupe by key.
let rendererPromise: Promise<Renderer> | undefined;
const registeredFontKeys = new Set<string>();

async function initRenderer(): Promise<Renderer> {
	await handleAsync(
		async () => {
			// same dance takumi-js does internally to unwrap the auto module
			const resolved =
				typeof autoModule === "function" ? await autoModule() : await autoModule;
			const input =
				resolved && typeof resolved === "object" && "default" in resolved
					? (resolved as { default: unknown }).default
					: resolved;
			await initTakumiWasm(input ? { module_or_path: input } : undefined);
		},
		ErrorCodes.TAKUMI_INIT_FAILED,
		"Failed to initialize Takumi WASM"
	);
	return new WasmRenderer() as unknown as Renderer;
}

/** A rejected init clears the cache so the next request retries. */
function useRenderer(): Promise<Renderer> {
	rendererPromise ??= initRenderer().catch((error) => {
		rendererPromise = undefined;
		throw error;
	});
	return rendererPromise;
}

async function registerFonts(renderer: Renderer, fonts: ResolvedFont[]): Promise<void> {
	for (const font of fonts) {
		const key = `${font.name ?? "unnamed"}-${font.weight ?? "auto"}-${font.style ?? "normal"}`;
		if (registeredFontKeys.has(key)) continue;
		await handleAsync(
			() => renderer.registerFont(font as FontDetails),
			ErrorCodes.FONT_LOAD_FAILED,
			`Failed to register Takumi font: ${key}`
		);
		registeredFontKeys.add(key);
	}
}

export type TakumiEngineOptions = Omit<TakumiOptions, "fonts"> & { fonts: ResolvedFont[] };

/** VNode in, image bytes (or an svg string) out. */
export async function render(
	vnode: VNode,
	options: TakumiEngineOptions
): Promise<Uint8Array | string> {
	const renderer = await useRenderer();
	await registerFonts(renderer, options.fonts);

	const { width, height, format = "png", quality, stylesheets, emoji } = options;
	const shared = { renderer, width, height, stylesheets, emoji };

	createLogger(options.debug ?? false).debug(`Rendering ${format.toUpperCase()} with Takumi`);

	if (format === "svg") {
		return handleAsync(
			() => renderSvg(vnode, shared),
			ErrorCodes.TAKUMI_RENDER_FAILED,
			"Failed to render SVG with Takumi"
		);
	}

	return handleAsync(
		() => takumiRender(vnode, { ...shared, format, quality }),
		ErrorCodes.TAKUMI_RENDER_FAILED,
		"Failed to render image with Takumi"
	);
}
