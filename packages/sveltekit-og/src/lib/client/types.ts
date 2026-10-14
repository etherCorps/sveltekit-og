import type { ImageResponseOptions } from "../types.js";
import type { TakumiImageResponseOptions } from "../takumi/types.js";

/**
 * Options for the client `ImageResponse` / `createImage`. The `engine` field
 * selects the renderer and narrows the rest of the options to that engine's
 * shape (fonts, formats and emoji differ between the two).
 *
 * @default engine "takumi"
 */
export type ClientImageResponseOptions =
	| ({ engine?: "takumi" } & TakumiImageResponseOptions)
	| ({ engine: "satori" } & ImageResponseOptions);
