import satori, { init } from 'satori/wasm';
import initYoga from 'yoga-wasm-web';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import { loadGoogleFont } from './font.js';
import type { ImageResponseOptions } from './types.js';
import {toReactElement, svelteComponentToJsx} from "@ethercorps/svelte-h2j"

import { html } from "satori-html";
import {ImageResponse as IR} from "@vercel/og"
import type {SvelteComponent} from "svelte";

export const ImageResponse = async (htmlTemplate: string, options?: ImageResponseOptions) => {
    const reactVNode = toReactElement(`${htmlTemplate}`);
    console.log(reactVNode)
    return new IR(reactVNode, options)
};

export const componentToImageResponse = async (component: SvelteComponent, props: Record<string, any>, options?: ImageResponseOptions) => {
    const ssrSvelte = component.render(props);
    console.log(ssrSvelte);
    return ImageResponse(`${ssrSvelte.html}<style>${ssrSvelte.css.code}</style>`, options)
};

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

export declare type ImageResponseOptions = ImageOptions & ConstructorParameters<typeof Response>[1];

declare type ImageOptions = {
    /**
     * The width of the image.
     *
     * @type {number}
     * @default 1200
     */
    width?: number;
    /**
     * The height of the image.
     *
     * @type {number}
     * @default 630
     */
    height?: number;
    /**
     * Display debug information on the image.
     *
     * @type {boolean}
     * @default false
     */
    debug?: boolean;
    /**
     * A list of fonts to use.
     *
     * @type {{ data: ArrayBuffer; name: string; weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900; style?: 'normal' | 'italic' }[]}
     * @default Noto Sans Latin Regular.
     */
    fonts?: FontOptions[];
    /**
     * Using a specific Emoji style. Defaults to `twemoji`.
     *
     * @link https://github.com/vercel/og#emoji
     * @type {EmojiType}
     * @default 'twemoji'
     */
    emoji?: EmojiType;
};
