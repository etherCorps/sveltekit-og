import type { SatoriOptions } from "satori";
import type {
	ImageOptions as CoreImageOptions,
	ImageResponseOptions as CoreImageResponseOptions,
	ResponseOptions,
} from "./core/types.js";

export type Font = SatoriOptions["fonts"][number];
export type Fonts = Font[];
export type FontStyle = Font["style"];
export type FontWeight = Font["weight"];

export type FinalFontOptions = NonNullable<Fonts>;

/** v4 name; the engine options union (`engine` picks the shape, Takumi when omitted). */
export type ImageOptions = CoreImageOptions;

export type ResponseImageOptions = ResponseOptions;

/**
 * Image response options type exposed to devs for ImageResponse Instance
 * */
export type ImageResponseOptions = CoreImageResponseOptions;

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
