import { AsyncLocalStorage } from 'node:async_hooks';

const PREFIX = '[SvelteKit-OG]';

// Store for request-scoped debug flag
const debugStorage = new AsyncLocalStorage<boolean>();

/**
 * Get the current debug flag from the request context
 */
export function isDebugEnabled(): boolean {
	return debugStorage.getStore() ?? false;
}

export function withDebug<T>(enabled: boolean, fn: () => T): T {
	return debugStorage.run(enabled, fn);
}

export const logger = {
	debug: (message: string, ...args: unknown[]) => {
		if (isDebugEnabled()) {
			console.log(`${PREFIX} 🔍 ${message}`, ...args);
		}
	},
	info: (message: string, ...args: unknown[]) => {
		if (isDebugEnabled()) {
			console.info(`${PREFIX} ℹ️ ${message}`, ...args);
		}
	},
	warn: (message: string, ...args: unknown[]) => {
		if (isDebugEnabled()) {
			console.warn(`${PREFIX} ⚠️ ${message}`, ...args);
		}
	},
	error: (message: string, ...args: unknown[]) => {
		if (isDebugEnabled()) {
			console.error(`${PREFIX} ❌ ${message}`, ...args);
		}
	}
};
