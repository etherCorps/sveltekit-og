import satori, { type SatoriOptions } from 'satori';
import { Resvg, type ResvgRenderOptions } from '@resvg/resvg-js';
import type { SvelteComponent } from 'svelte';

const fontFile = await fetch('https://sveltekit-og.ethercorps.io/noto-sans.ttf');
const fontData: ArrayBuffer = await fontFile.arrayBuffer();

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
	const reSvgObject = new Resvg(svg, reSvgOptions);
	const pngData = await reSvgObject.render().asPng();

	return new Response(pngData, {
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

export { componentToImageResponse, ImageResponse, type ImageResponseType };
