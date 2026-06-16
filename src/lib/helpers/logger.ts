const PREFIX = '[SvelteKit-OG]';

export type Logger = ReturnType<typeof createLogger>;

export function createLogger(debug: boolean) {
	return {
		debug: (message: string, ...args: unknown[]) => {
			if (debug) console.log(`${PREFIX} 🔍 ${message}`, ...args);
		},
		info: (message: string, ...args: unknown[]) => {
			if (debug) console.info(`${PREFIX} ℹ️ ${message}`, ...args);
		},
		warn: (message: string, ...args: unknown[]) => {
			if (debug) console.warn(`${PREFIX} ⚠️ ${message}`, ...args);
		},
		error: (message: string, ...args: unknown[]) => {
			if (debug) console.error(`${PREFIX} ❌ ${message}`, ...args);
		}
	};
}
