import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { loadGoogleFont } from './font.js';
import type { ImageResponseOptions } from './types.js';
import {toReactElement, svelteComponentToJsx} from "@ethercorps/svelte-h2j"
import type {SvelteComponent} from "svelte";

export const og = async ( element: string | SvelteComponent, options: ImageResponseOptions, props = {}) => {

    const reactElement = typeof element === 'string' ? toReactElement(element) : svelteComponentToJsx(element, props);

    // render the React element-like object into an SVG
    const svg = await satori(reactElement, {
        width: options.width || 1200,
        height: options.height || 630,
        fonts: options.fonts?.length
            ? options.fonts
            : [
                {
                    name: 'Bitter',
                    data: await loadGoogleFont({ family: 'Bitter', weight: 600 }),
                    weight: 500,
                    style: 'normal'
                }
            ]
    });

    const requestedFormat = options.format || 'png';

    if (requestedFormat === 'svg') {
        return svg;
    }

    // convert the SVG into a PNG
    const opts = {
        // background: "rgba(238, 235, 230, .9)",
        fitTo: {
            mode: 'width' as const,
            value: options.width || 1200
        },
        font: {
            loadSystemFonts: false // It will be faster to disable loading system fonts.
        }
    };
    const resvg = new Resvg(svg, opts);
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    return pngBuffer;
};

export class ImageResponse extends Response {
    constructor(element: string | SvelteComponent, options: ImageResponseOptions = {} , props= {}) {
        super();

        const body = new ReadableStream({
            async start(controller) {
                const buffer = await og( element, options, props);
                controller.enqueue(buffer);
                controller.close();
            }
        });


        return new Response(body, {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': options.debug
                    ? 'no-cache, no-store'
                    : 'public, immutable, no-transform, max-age=31536000',
                ...options.headers
            },
            status: options.status || 200,
            statusText: options.statusText
        });
    }
}

declare const apis: {
    twemoji: (code: any) => string;
    openmoji: string;
    blobmoji: string;
    noto: string;
    fluent: (code: any) => string;
    fluentFlat: (code: any) => string;
};

declare type EmojiType = keyof typeof apis;

type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type Style$1 = 'normal' | 'italic';

interface FontOptions {
    data: Buffer | ArrayBuffer;
    name: string;
    weight?: Weight;
    style?: Style$1;
    lang?: string;
}
