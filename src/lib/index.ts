import satori, { type SatoriOptions } from 'satori';
import type { SvelteComponent } from 'svelte';
import toReactElement from './toReactElement';
import { svg2png, initialize, type ConvertOptions } from 'svg2png-wasm';

let initialized = false;

const fontFile = await fetch('https://sveltekit-og.ethercorps.io/noto-sans.ttf');
const fontData: ArrayBuffer = await fontFile.arrayBuffer();

const indexWasmRes = await fetch('https://unpkg.com/svg2png-wasm/svg2png_wasm_bg.wasm');
const svg2PngWasmBuffer = await indexWasmRes.arrayBuffer();

const initSvgToPng = async () => {
	await initialize(svg2PngWasmBuffer).catch((e) => console.log(e));
	initialized = true;
};

const ImageResponse = async (htmlTemplate: string, optionsByUser: ImageResponseOptions) => {
	const options = Object.assign({ width: 1200, height: 630, debug: !1 }, optionsByUser);
	const svg = await satori(toReactElement(htmlTemplate), {
		width: options.width,
		height: options.height,
		debug: options.debug,
		fonts: options.fonts || [
			{
				name: 'sans serif',
				data: fontData,
				style: 'normal',
				weight: 700
			}
		]
	});

	if (!initialized) {
		await initSvgToPng();
		initialized = true
	}

	const defaultConfig: ConvertOptions = {
		width: options.width, // optional
		height: options.height, // optional
	};

	if (Object.hasOwn(options, 'backgroundColor')) {
		defaultConfig.backgroundColor = options.backgroundColor
	}

	const png = await svg2png(svg, defaultConfig);

	return new Response(png, {
		headers: {
			'Content-Type': 'image/png',
			'cache-control': 'public, immutable, no-transform, max-age=31536000',
			...options.headers
		},

		status: options.status,
		statusText: options.statusText
	});
};

const componentToImageResponse = (
	component: typeof SvelteComponent,
	props = {},
	optionsByUser: ImageResponseOptions
) => {
	const htmlTemplate = componentToMarkup(component, props);
	return ImageResponse(htmlTemplate, optionsByUser);
};

const componentToMarkup = (component: typeof SvelteComponent, props = {}) => {
	const SvelteRenderedMarkup = (component as any).render(props);
	let htmlTemplate = `${SvelteRenderedMarkup.html}`;
	if (SvelteRenderedMarkup && SvelteRenderedMarkup.css && SvelteRenderedMarkup.css.code) {
		htmlTemplate = `${SvelteRenderedMarkup.html}<style>${SvelteRenderedMarkup.css.code}</style>`;
	}
	return htmlTemplate;
};

type ImageResponseOptions = ConstructorParameters<typeof Response>[1] & ImageOptions;

type ImageOptions = {
	width?: number;
	height?: number;
	debug?: boolean;
	fonts?: SatoriOptions['fonts'];
	backgroundColor?: string;
	graphemeImages?: Record<string, string>;
	loadAdditionalAsset?: (
		languageCode: string,
		segment: string
	) => Promise<SatoriOptions['fonts'] | string | undefined>;
};

export type ImageResponseType = typeof ImageResponse;

export { componentToImageResponse, ImageResponse, toReactElement };
