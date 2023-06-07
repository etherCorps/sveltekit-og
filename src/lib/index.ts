import satori, { type SatoriOptions } from 'satori';
import type { SvelteComponent } from 'svelte';
import toReactElement from './toReactElement';
import {Resvg as wasmSvg, initWasm, type ResvgRenderOptions} from "@resvg/resvg-wasm"
import {readFileSync} from "fs"
import { dirname } from "path"
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



const fontFile = await fetch('https://sveltekit-og.ethercorps.io/noto-sans.ttf');
const fontData: ArrayBuffer = await fontFile.arrayBuffer();

let initialized = false;
const initReSvg = async () => {
	const indexWasmRes = await fetch('https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm');
	const buffer = await indexWasmRes.arrayBuffer();
	await initWasm(buffer);
		// await initWasm( readFileSync( __dirname + "/resvg.wasm" ));
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

	const reSvgOptions = {
		fitTo: {
			mode: 'width',
			value: options.width
		}
	} as ResvgRenderOptions;

	if (!initialized) {
		await initReSvg();
		initialized = true
	}
	const reSvgInit = new wasmSvg(svg, reSvgOptions);
	const pngBuffer = reSvgInit.render().asPng();

	return new Response(pngBuffer, {
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
	graphemeImages?: Record<string, string>;
	loadAdditionalAsset?: (
		languageCode: string,
		segment: string
	) => Promise<SatoriOptions['fonts'] | string | undefined>;
};

type ImageResponseType = typeof ImageResponse;

export { componentToImageResponse, ImageResponse, toReactElement, type ImageResponseType };
