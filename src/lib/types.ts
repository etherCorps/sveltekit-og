import type { SatoriOptions } from 'satori/wasm';

export interface ImageResponseOptions {
    width?: number;
    height?: number;
    // emoji?: 'twemoji' | 'blobmoji' | 'noto' | 'openmoji' = 'twemoji',
    fonts?: SatoriOptions['fonts'];
    debug?: boolean;

    // Options that will be passed to the HTTP response
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;

    // Format
    format?: 'svg' | 'png'; // Defaults to 'png'
}

export interface RuntimeCompatibilitySchema {
    ['css-inline']: 'node' | 'wasm' | 'wasm-fs' | false
    resvg: 'node' | 'wasm' | 'wasm-fs' | false
    satori: 'node' | 'wasm' | 'wasm-fs' | false
    wasm?: WasmPluginOptions
}

interface WasmPluginOptions {
    /**
     * Directly import the `.wasm` files instead of bundling as base64 string.
     *
     * @default false
     */
    esmImport?: boolean;
    /**
     * Avoid using top level await and always use a proxy.
     *
     * Useful for compatibility with environments that don't support top level await.
     *
     * @default false
     */
    lazy?: boolean;
}