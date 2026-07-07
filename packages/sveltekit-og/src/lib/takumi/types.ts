import type { EmojiType } from "takumi-js/helpers/emoji";
import type { OutputFormat } from "takumi-js/node";
import type { TakumiFontInput } from "./fonts.js";

/** Static output formats Takumi can encode, plus vector `svg`. */
export type TakumiFormat = OutputFormat | "svg";

export type TakumiImageOptions = {
	/**
	 * Width of the image.
	 * @default 1200
	 * */
	width?: number;
	/**
	 * Height of the image.
	 * @default 630
	 * */
	height?: number;
	/**
	 * Output format.
	 * @default png
	 * */
	format?: TakumiFormat;
	/**
	 * Quality for lossy formats (jpeg, lossy webp), 0-100.
	 * */
	quality?: number;
	/**
	 * Fonts to register. Accepts this library's `GoogleFont`/`CustomFont`
	 * helpers or raw Takumi font descriptors. If omitted, Takumi's built-in
	 * sans-serif is used.
	 * */
	fonts?: TakumiFontInput[];
	/**
	 * Extra CSS stylesheets applied before rendering.
	 * */
	stylesheets?: string[];
	/**
	 * Emoji provider, or `"from-font"` to source emoji glyphs from loaded fonts.
	 * @default twemoji
	 * */
	emoji?: EmojiType | "from-font";
	/**
	 * Enable debug logging.
	 * @default false
	 * */
	debug?: boolean;
};

export type TakumiResponseOptions = {
	/**
	 * Response status code.
	 * @default 200
	 * */
	status?: number;
	/**
	 * Response status text.
	 * @default Success
	 * */
	statusText?: string;
	/**
	 * Response headers.
	 * */
	headers?: Record<string, string>;
};

/** Options for the Takumi `ImageResponse`. */
export type TakumiImageResponseOptions = TakumiImageOptions & TakumiResponseOptions;
