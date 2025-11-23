import { FONT_CACHE_MAP } from '$lib/helpers/cache.js';
import type { FinalFontOptions, FontStyle, FontWeight, MayBePromise } from '$lib/types.js';

// Code stolen from https://github.com/fineshopdesign/cf-wasm
interface BaseFontOptions {
	weight?: FontWeight;
	style?: FontStyle;
}

/** * Base font class defining the structure required by Satori.
 * All font types inherit from this class.
 */
export class BaseFont {
	protected input: any;

	name: string;
	style: FontStyle;
	weight: FontWeight;

	constructor(name: string, input: any, { weight = 400, style = 'normal' }: BaseFontOptions = {}) {
		this.input = input;
		this.name = name;
		this.style = style;
		this.weight = weight;
	}

	/** * Abstract getter that returns the promised ArrayBuffer.
	 * Overridden by CustomFont and GoogleFont for lazy loading.
	 */
	get data(): MayBePromise<Buffer | ArrayBuffer> {
		return this.input;
	}
}

/** * A helper class to load Custom fonts, typically from local files.
 * The input must be a function provided by the user (e.g., using $app/server/read).
 */
export class CustomFont extends BaseFont {
	private promise?: Promise<Buffer | ArrayBuffer>;

	/**
	 * Creates an instance of CustomFont.
	 * @param name The name of the font (for CSS font-family).
	 * @param input Font data as ArrayBuffer or a function that resolves to ArrayBuffer (user must provide the loading logic).
	 */
	constructor(
		name: string,
		input: MayBePromise<Buffer | ArrayBuffer> | (() => MayBePromise<Buffer | ArrayBuffer>),
		options?: BaseFontOptions
	) {
		super(name, input, options);
	}

	/** A promise which resolves to font data as `ArrayBuffer` (Lazy load) */
	get data(): Promise<Buffer | ArrayBuffer> {
		// Defines the loading mechanism: execute the input function or resolve the promise/buffer.
		const fallback = async () => (typeof this.input === 'function' ? this.input() : this.input);

		// Memoization: ensures the input function is executed only once.
		this.promise = this.promise?.then(null, fallback) ?? fallback();
		return this.promise;
	}
}

/** Constructs Google font css url */
const constructGoogleFontCssUrl = (
	family: string,
	{ text, weight = 400, style = 'normal', display }: { text?: string; weight?: string | number; style?: FontStyle; display?: FontDisplay } = {},
) => {
	// Logic to build the URL (e.g., https://fonts.googleapis.com/css2?family=...wght@...)
	const params: Record<string, string> = {
		family: `${family.replaceAll(' ', '+')}:${style === 'italic' ? 'ital,' : ''}wght@${style === 'italic' ? '1,' : ''}${weight}`,
	};
	if (text) params.text = encodeURIComponent(text);
	return `https://fonts.googleapis.com/css2?${Object.keys(params).map((key) => `${key}=${params[key]}`).join('&')}`;
};

/** Loads Google font ArrayBuffer with caching. */
export const loadGoogleFont = async (
	family: string,
	{ text, weight = 400, style = 'normal', display }: { text?: string; weight?: string | number; style?: FontStyle; display?: FontDisplay } = {}
) => {
	const cssUrl = constructGoogleFontCssUrl(family, { text, weight, display, style });

	const fromMap = FONT_CACHE_MAP.get(cssUrl);
	if (fromMap) {
		return fromMap;
	}

	const cssResponse = await fetch(cssUrl);
	if (!cssResponse.ok) {
		throw new Error(`Failed to fetch Google Font CSS for ${family}. Status: ${cssResponse.status}`);
	}
	const css = await cssResponse.text();

	// 3. Extract the font file URL (the actual TTF/OTF file)
	const fontUrl = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/)?.[1];

	if (!fontUrl) {
		throw new Error(`Could not find a compatible truetype font source in the CSS for ${family}.`);
	}

	// 4. Fetch the font buffer
	const fontResponse = await fetch(fontUrl);
	if (!fontResponse.ok) {
		throw new Error(`Failed to fetch font file from URL. Status: ${fontResponse.status}`);
	}
	const buffer = await fontResponse.arrayBuffer();

	// 5. CACHE AND RETURN: Store the resolved ArrayBuffer in the Map, keyed by the CSS URL.
	FONT_CACHE_MAP.set(cssUrl, buffer);
	return buffer;
};

export class GoogleFont extends BaseFont {
	family: string;
	text: string | undefined;
	private promise?: Promise<ArrayBuffer>;

	constructor(family: string, options: { name?: string; text?: string; weight?: FontWeight; style?: FontStyle } = {}) {
		super(options.name || family, undefined, options);
		this.family = family;
		this.text = options.text;
	}

	get data(): Promise<ArrayBuffer> {
		const fallback = async () =>
			loadGoogleFont(this.family, {
				weight: this.weight,
				style: this.style,
				text: this.text,
			});
		this.promise = this.promise?.then(null, fallback) ?? fallback();
		return this.promise;
	}
}

export async function resolveFonts(
	fontClasses: Array<CustomFont | GoogleFont>
): Promise<FinalFontOptions> {
	const resolvedFonts = await Promise.all(
		fontClasses.map(async (fontClass) => {
			const dataBuffer = await fontClass.data;
			return {
				name: fontClass.name,
				data: dataBuffer, // The resolved ArrayBuffer/Buffer
				weight: fontClass.weight,
				style: fontClass.style,
			};
		})
	);
	return resolvedFonts.filter(font => font !== null) as FinalFontOptions;
}