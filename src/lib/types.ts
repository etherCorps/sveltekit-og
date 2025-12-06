import type { SatoriOptions } from "satori/wasm";
import type { EmojiType } from "./helpers/emoji.js";

export type Font = SatoriOptions["fonts"][number];
export type Fonts = Font[];
export type FontStyle = Font["style"];
export type FontWeight = Font["weight"];

export type FinalFontOptions = NonNullable<Fonts>;

export type ImageOptions = {
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
	 * Emoji provider
	 * @default twemoji
	 * */
	emoji?: EmojiType;
	/**
	 * Fonts used for your text
	 * @default `helpers/defaults.js`
	 * */
	fonts?: Fonts;
	/**
	 * Tailwind config
	 * @default provided by satori
	 * */
	tailwindConfig?: SatoriOptions["tailwindConfig"];
	/**
	 * Debug operations
	 * @default false
	 * */
	debug?: boolean;
	/**
	 * Image format
	 * @default png
	 * */
	format?: "svg" | "png"; // Defaults to 'png'
};

export type ResponseImageOptions = {
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
	 * Response Headers
	 * @default {
	 *   'Content-Type': 'image/png',
	 *   'Cache-Control': options.debug ? 'no-cache, no-store' : 'public, immutable, no-transform, max-age=31536000'
	 * }
	 * */
	headers?: Record<string, string>;
};

/**
 * Image response options type exposed to devs for ImageResponse Instance
 * */
export type ImageResponseOptions = ImageOptions & ResponseImageOptions;

/**
 * Svelte Component props to render the component which dynamic content
 * */
export type ComponentOptions = {
	props?: Record<string, unknown>;
};

/**
 * React virtual node, supported by satori as input (alternative to JSX input).
 * */
export interface VNode {
	type: string;
	props: {
		style?: Record<string, unknown>;
		children?: string | VNode | VNode[];
		[prop: string]: unknown;
	};
}

/** utils types */
export type MayBePromise<T> = T | Promise<T>;

export type OnlyProps<T, P> = {
	[K in keyof T as K extends P ? K : never]: T[K];
};

// permits `string` but gives hints
export type StringWithSuggestions<S extends string> = (string & Record<never, never>) | S;
