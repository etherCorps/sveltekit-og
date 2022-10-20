import { html as toReactNode } from 'satori-html';
import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import { join } from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import type { SvelteComponent } from 'svelte';
import type { SatoriOptions } from 'satori';

const __filename = fileURLToPath(import.meta.url);
const resSvgWasm = initWasm(readFileSync(join(__filename, '../vendors/resvg.wasm')));
const fontFile = await fetch('https://og-playground.vercel.app/inter-latin-ext-400-normal.woff');
const fontData: ArrayBuffer = await fontFile.arrayBuffer();

export const ImageResponse = class {
	constructor(htmlTemplate: string, optionsByUser: ImageResponseOptions) {
		const options = Object.assign({ width: 1200, height: 630, debug: !1 }, optionsByUser);
		const png = new ReadableStream({
			async start(a) {
				await resSvgWasm;
				const svg = await satori(toReactNode(htmlTemplate), {
					width: options.width,
					height: options.height,
					fonts: options.fonts || [
						{
							name: 'Inter Latin',
							data: fontData,
							weight: 400,
							style: 'normal'
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
};

export const componentToImageResponse = class {
	constructor(component: SvelteComponent, props = {}, optionsByUser: ImageResponseOptions) {
		const SvelteRenderedMarkup = component.render(props);
		let htmlTemplate = `${SvelteRenderedMarkup.html}`;
		if (SvelteRenderedMarkup && SvelteRenderedMarkup.css && SvelteRenderedMarkup.css.code) {
			htmlTemplate = `${SvelteRenderedMarkup.html}<style>${SvelteRenderedMarkup.css.code}</style>`;
		}
		return new ImageResponse(htmlTemplate, optionsByUser);
	}
};

export type ImageResponseOptions = ConstructorParameters<typeof Response>[1] & ImageOptions;
type ImageOptions = {
	width?: number;
	height?: number;
	debug?: boolean;
	fonts?: SatoriOptions['fonts'];
};
