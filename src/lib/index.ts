import { html as toReactNode } from 'satori-html';
import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import type { SatoriOptions } from 'satori';
import type { SvelteComponent } from 'svelte';

const resSvgWasm = initWasm(fetch('https://sveltekit-og.ethercorps.io/resvg.wasm'));
const fontFile = await fetch('https://sveltekit-og.ethercorps.io/noto-sans.ttf');
const fontData: ArrayBuffer = await fontFile.arrayBuffer();

class ImageResponse {
	constructor(htmlTemplate: string, optionsByUser: ImageResponseOptions) {
		const options = Object.assign({ width: 1200, height: 630, debug: !1 }, optionsByUser);
		const png = new ReadableStream({
			async start(a) {
				await resSvgWasm;
				const svg = await satori(toReactNode(htmlTemplate), {
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
				const pngData = new Resvg(svg, { fitTo: { mode: 'width', value: options.width } });
				a.enqueue(pngData.render().asPng());
				a.close();
			}
		});
		return new Response(png, {
			headers: {
				'Content-Type': 'image/png',
				'cache-control': 'public, immutable, no-transform, max-age=31536000',
				...options.headers
			},

			status: options.status,
			statusText: options.statusText
		});
	}
}

class componentToImageResponse {
	constructor(component: typeof SvelteComponent, props = {}, optionsByUser: ImageResponseOptions) {
		const htmlTemplate = componentToMarkup(component, props);
		return new ImageResponse(htmlTemplate, optionsByUser);
	}
}

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

export { componentToImageResponse, ImageResponse };
