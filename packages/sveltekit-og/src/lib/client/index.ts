export { ImageResponse, createImage, renderImage } from "./render.js";
export type {
	Engine,
	Format,
	ImageOptions,
	ImageResponseOptions,
	TakumiOptions,
	SatoriOptions,
	ResponseOptions,
	FontInput,
	FontDescriptor,
	Element,
} from "../core/types.js";
export { ImageResponseError, ErrorCodes } from "../helpers/error-handler.js";

/** v4 name for the client options; same type as the root entry's. */
export type { ImageResponseOptions as ClientImageResponseOptions } from "../core/types.js";

// CustomFont works anywhere (you supply the bytes); resolveFonts turns it into the
// shape satori needs. GoogleFont/loadGoogleFont are deliberately not re-exported: a
// browser can't set the User-Agent, so Google serves woff2 and the loader rejects it.
export { CustomFont, resolveFonts } from "../fonts.js";
