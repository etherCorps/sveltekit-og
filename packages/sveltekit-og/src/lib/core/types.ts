import type { SatoriOptions as SatoriLibOptions } from "satori";
import type { EmojiType as TakumiEmoji } from "takumi-js/helpers/emoji";
import type { OutputFormat } from "takumi-js/node";
import type { EmojiType as SatoriEmoji } from "../helpers/emoji.js";
import type { BaseFont } from "../fonts.js";
import type { MayBePromise } from "../types.js";

export type Engine = "takumi" | "satori";

type Bytes = Uint8Array | ArrayBuffer;

/** A raw font: bytes (or a lazy loader for them) plus how to register it. */
export interface FontDescriptor {
	name?: string;
	data: MayBePromise<Bytes> | (() => MayBePromise<Bytes>);
	weight?: number;
	style?: "normal" | "italic";
}

/** Any font either engine accepts: `GoogleFont`/`CustomFont` or a raw descriptor. */
export type FontInput = BaseFont | FontDescriptor;

/** A font with its bytes loaded, ready to hand to an engine. */
export interface ResolvedFont {
	/** Optional for Takumi (read from the font file); Satori needs it. */
	name?: string;
	data: Bytes;
	weight?: number;
	style?: "normal" | "italic";
}

export type BaseOptions = {
	/**
	 * Width of the image
	 * @default 1200
	 * */
	width?: number;
	/**
	 * Height of the image
	 * @default 630
	 * */
	height?: number;
	/**
	 * Fonts used for your text. Satori falls back to Noto Sans, Takumi to its built-in sans-serif.
	 * */
	fonts?: FontInput[];
	/**
	 * Debug logging (and Satori's layout boxes)
	 * @default false
	 * */
	debug?: boolean;
};

export type TakumiOptions = BaseOptions & {
	engine?: "takumi";
	/**
	 * Output format
	 * @default png
	 * */
	format?: OutputFormat | "svg";
	/**
	 * Quality for lossy formats (jpeg, lossy webp), 0-100.
	 * */
	quality?: number;
	/**
	 * Extra CSS stylesheets applied before rendering.
	 * */
	stylesheets?: string[];
	/**
	 * Emoji provider, or `"from-font"` to source emoji glyphs from loaded fonts.
	 * @default twemoji
	 * */
	emoji?: TakumiEmoji | "from-font";
};

export type SatoriOptions = BaseOptions & {
	engine: "satori";
	/**
	 * Output format
	 * @default png
	 * */
	format?: "png" | "svg";
	/**
	 * Emoji provider
	 * @default twemoji
	 * */
	emoji?: SatoriEmoji;
	/**
	 * Tailwind config
	 * @default provided by satori
	 * */
	tailwindConfig?: SatoriLibOptions["tailwindConfig"];
};

export type ImageOptions = TakumiOptions | SatoriOptions;

export type Format = NonNullable<TakumiOptions["format"]>;

export type ResponseOptions = {
	/**
	 * Status code for response
	 * @default 200
	 * */
	status?: number;
	/**
	 * Status text for response
	 * @default Success
	 * */
	statusText?: string;
	/**
	 * Response headers, merged over the defaults
	 * @default {
	 *   'Content-Type': <format's content type>,
	 *   'Cache-Control': options.debug ? 'no-cache, no-store' : 'public, immutable, no-transform, max-age=31536000'
	 * }
	 * */
	headers?: Record<string, string>;
};
