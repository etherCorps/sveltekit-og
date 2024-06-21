import { provider, env, runtime, isDevelopment } from 'std-env';
import { runtimeCompatibility } from '../runtime/compatability.js';
import type { RuntimeCompatibility, SupportedRuntimes } from '../types.js';

export function getRuntime(): SupportedRuntimes {
	if (provider === 'stackblitz' || provider === 'codesandbox') return provider
	if (isDevelopment) {
		return 'node';
	}
	const parsedProvider = provider.replace('_', '-')
	const compatibility = runtimeCompatibility[env['OG_RUNTIME'] || parsedProvider];
	if (compatibility) return parsedProvider;

	switch (runtime) {
		case 'node':
		case 'deno':
		case 'bun':
		case 'netlify':
		default:
			return 'node'
		case 'edge-light':
			return 'vercel-edge'
		case 'workerd':
			return 'cloudflare-workers'
	}
}

export function getRuntimeCompatibility(runtime: SupportedRuntimes = getRuntime()): RuntimeCompatibility {
	return runtimeCompatibility[runtime]
}