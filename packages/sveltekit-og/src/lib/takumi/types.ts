import type { Format, ResponseOptions, TakumiOptions } from "../core/types.js";

/** Static output formats Takumi can encode, plus vector `svg`. */
export type TakumiFormat = Format;

export type TakumiImageOptions = Omit<TakumiOptions, "engine">;

export type TakumiResponseOptions = ResponseOptions;

/** Options for the Takumi `ImageResponse`. */
export type TakumiImageResponseOptions = TakumiImageOptions & TakumiResponseOptions;
