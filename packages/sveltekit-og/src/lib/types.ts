import type { SatoriOptions } from "satori";
import type { SatoriOptions as CoreSatoriOptions, ResponseOptions } from "./core/types.js";

export type Font = SatoriOptions["fonts"][number];
export type Fonts = Font[];
export type FontStyle = Font["style"];
export type FontWeight = Font["weight"];

export type FinalFontOptions = NonNullable<Fonts>;

/** Satori image options for the root `ImageResponse` (engine is fixed to satori there). */
export type ImageOptions = Omit<CoreSatoriOptions, "engine">;

export type ResponseImageOptions = ResponseOptions;

/**
 * Image response options type exposed to devs for ImageResponse Instance
 * */
export type ImageResponseOptions = ImageOptions & ResponseImageOptions;

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
