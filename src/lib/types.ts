import type { SatoriOptions } from 'satori/wasm';

export type ImageOptions = {
    /**
     * Width of the image
     * @default 1200
     * */
    width?: number;
    /**
     * Height of the image
     * @default 630
     * */
    height?: number;
    /**
     * Emoji provider
     * @default twemoji
     * */
    emoji?: 'twemoji' | 'blobmoji' | 'noto' | 'openmoji' | 'fluent' | 'fluentFlat',
    /**
     * Fonts used for your text
     * @default `helpers/defaults.js`
     * */
    fonts?: SatoriOptions['fonts'];
    /**
     * Tailwind config
     * @default provided by satori
     * */
    tailwindConfig?: SatoriOptions['tailwindConfig'];
    /**
     * Debug operations
     * @default false
     * */
    debug?: boolean
    /**
     * Image format
     * @default png
     * */
    format?: 'svg' | 'png'; // Defaults to 'png'
};

export type ResponseImageOptions = {
    /**
     * Status code for response
     * @default 200
     * */
    status?: number;
    /**
     * Status text for response
     * @default Success
     * */
    statusText?: string;
    /**
     * Response Headers
     * @default {
     *   'Content-Type': 'image/png',
     *   'Cache-Control': options.debug ? 'no-cache, no-store' : 'public, immutable, no-transform, max-age=31536000'
     * }
     * */
    headers?: Record<string, string>;
};

/**
 * Image response options type exposed to devs for ImageResponse Instance
 * */
export type ImageResponseOptions = ImageOptions & ResponseImageOptions;

/**
 * Svelte Component props to render the component which dynamic content
 * */
export type ComponentOptions =  {
    props?: Record<string, any>
};

/**
 * React virtual node, supported by satori as input (alternative to JSX input).
 * */
export interface VNode {
    type: string;
    props: {
        style?: Record<string, any>;
        children?: string | VNode | VNode[];
        [prop: string]: any;
    };
}
