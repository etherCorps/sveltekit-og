import type { RuntimeCompatibility, SupportedRuntimes } from '../types.js';

const NodeRuntime: RuntimeCompatibility = {
	'resvg': 'wasm',
	'satori': 'wasm',
}

const WorkersRuntime: RuntimeCompatibility = {
	'resvg': 'wasm',
	'satori': 'node',
}

const WebContainerRuntime: RuntimeCompatibility = {
	'resvg': 'wasm-fs',
	'satori': 'wasm-fs',
}

export const runtimeCompatibility: Record<SupportedRuntimes, RuntimeCompatibility> = {
	'dev': NodeRuntime,
	'node': NodeRuntime,
	'stackblitz': WebContainerRuntime,
	'codesandbox': WebContainerRuntime,
	'aws-lambda': NodeRuntime,
	'netlify': NodeRuntime,
	'netlify-edge': WorkersRuntime,
	'vercel': NodeRuntime,
	'vercel-edge': WorkersRuntime,
	'cloudflare-pages': WorkersRuntime,
	'cloudflare-workers': WorkersRuntime
}