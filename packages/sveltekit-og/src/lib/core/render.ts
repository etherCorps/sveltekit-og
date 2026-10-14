import type {
	AnyComponent,
	Element,
	Engine,
	Format,
	ImageOptions,
	ResponseOptions,
} from "./types.js";
import type { SatoriAssets } from "./engines/satori.js";
import { resolveFontInputs } from "./fonts.js";
import { createVNode } from "../helpers/toJSX.js";
import { ImageResponseError, ErrorCodes } from "../helpers/error-handler.js";
import { buildImageResponse, CONTENT_TYPES } from "../helpers/response.js";
import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from "../helpers/defaults.js";

/**
 * What differs between server and client: how a Svelte component becomes HTML,
 * and how Satori's wasm + fallback fonts load. Everything else is this file.
 */
export interface Platform {
	componentToHtml(
		component: AnyComponent,
		props: Record<string, unknown>
	): string | Promise<string>;
	satori: SatoriAssets;
}

export const DEFAULTS = {
	width: DEFAULT_WIDTH,
	height: DEFAULT_HEIGHT,
	format: "png",
	emoji: "twemoji",
	debug: false,
} as const;

const SATORI_FORMATS: readonly Format[] = ["png", "svg"];

/** Formats the engine can't emit are an error, never a silent png fallback. */
function assertFormat(engine: Engine, format: string): asserts format is Format {
	const ok =
		engine === "satori" ? SATORI_FORMATS.includes(format as Format) : format in CONTENT_TYPES;
	if (!ok) {
		throw new ImageResponseError(
			`Format "${format}" is not supported by the ${engine} engine`,
			ErrorCodes.UNSUPPORTED_FORMAT
		);
	}
}

// one lazy chunk per engine: the other engine's JS + wasm is never fetched. Memoized so
// warm renders skip the module loader; a failed load (e.g. chunk fetch) clears it to retry.
let satoriEngine: Promise<typeof import("./engines/satori.js")> | undefined;
let takumiEngine: Promise<typeof import("./engines/takumi.js")> | undefined;

const loadSatori = () =>
	(satoriEngine ??= import("./engines/satori.js").catch((error) => {
		satoriEngine = undefined;
		throw error;
	}));
const loadTakumi = () =>
	(takumiEngine ??= import("./engines/takumi.js").catch((error) => {
		takumiEngine = undefined;
		throw error;
	}));

/** Element → HTML → VNode → engine → bytes (svg → string). Defaults to Takumi. */
export async function renderImage(
	element: Element,
	options: ImageOptions & ResponseOptions,
	props: Record<string, unknown> | undefined,
	platform: Platform
): Promise<Uint8Array | string> {
	// response-only keys would otherwise leak into satori's options
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { status, statusText, headers, ...opts } = { ...DEFAULTS, ...options };
	const engine = opts.engine ?? "takumi";
	assertFormat(engine, opts.format);

	const html =
		typeof element === "string"
			? element
			: await platform.componentToHtml(element, props ?? {});
	const vnode = createVNode(html);
	const fonts = opts.fonts?.length ? await resolveFontInputs(opts.fonts) : undefined;

	if (engine === "satori") {
		const { render } = await loadSatori();
		const satoriFonts = fonts ?? (await platform.satori.fonts());
		return render(
			vnode,
			{ ...(opts as typeof opts & { engine: "satori" }), fonts: satoriFonts },
			platform.satori
		);
	}

	const { render } = await loadTakumi();
	return render(vnode, { ...(opts as typeof opts & { engine?: "takumi" }), fonts: fonts ?? [] });
}

/** Body + init for an `ImageResponse`; render errors surface through the body stream. */
export function imageResponseInit(
	element: Element,
	options: (ImageOptions & ResponseOptions) | undefined,
	props: Record<string, unknown> | undefined,
	platform: Platform
): { body: ReadableStream; init: ResponseInit } {
	const format = options?.format ?? DEFAULTS.format;
	return buildImageResponse(() => renderImage(element, options ?? {}, props, platform), {
		label: format.toUpperCase(),
		contentType: CONTENT_TYPES[format] ?? "application/octet-stream",
		debug: options?.debug ?? DEFAULTS.debug,
		headers: options?.headers,
		status: options?.status,
		statusText: options?.statusText,
	});
}
