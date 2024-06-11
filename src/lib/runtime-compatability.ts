import type { RuntimeCompatibilitySchema } from './types.js';

export const NodeRuntime: RuntimeCompatibilitySchema = {
	'css-inline': 'node',
	'resvg': 'node',
	'satori': 'node',
}

const cloudflare: RuntimeCompatibilitySchema = {
	'css-inline': false,
	'resvg': 'wasm',
	'satori': 'node',
	'wasm': {
		esmImport: true,
		lazy: true,
	},
}
const awsLambda: RuntimeCompatibilitySchema = {
	'css-inline': 'node',
	'resvg': 'node',
	'satori': 'node',
}

export const WebContainer: RuntimeCompatibilitySchema = {
	'css-inline': 'wasm-fs',
	'resvg': 'wasm-fs',
	'satori': 'wasm-fs',
}

export const RuntimeCompatibility: Record<string, RuntimeCompatibilitySchema> = {
	'dev': NodeRuntime,
	'node': NodeRuntime,
	'stackblitz': WebContainer,
	'codesandbox': WebContainer,
	'aws-lambda': awsLambda,
	'netlify': awsLambda,
	'netlify-edge': cloudflare,
	// 'firebase': awsLambda,
	'vercel': awsLambda,
	'vercel-edge': cloudflare,
	'cloudflare-pages': cloudflare,
	'cloudflare-workers': cloudflare,
} as const