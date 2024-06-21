import type { SatoriOptions } from 'satori/wasm';

export interface ImageResponseOptions {
    width?: number;
    height?: number;
    emoji?: 'twemoji' | 'blobmoji' | 'noto' | 'openmoji' | 'fluent' | fluentFlat,
    fonts?: SatoriOptions['fonts'];
    debug?: boolean;

    // Options that will be passed to the HTTP response
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;

    // Format
    format?: 'svg' | 'png'; // Defaults to 'png'

    // Debug
    debug?: boolean
}

export interface RuntimeCompatibility {
    resvg: 'node' | 'wasm' | 'wasm-fs'
    satori: 'node' | 'wasm' | 'wasm-fs'
}


export type SupportedRuntimes = 'node' | 'stackblitz' | 'codesandbox' | 'aws-lambda' | 'netlify' | 'netlify-edge' | 'vercel' | 'vercel-edge' | 'cloudflare-pages' | 'cloudflare-workers'