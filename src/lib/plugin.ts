import { unwasm, type UnwasmPluginOptions } from "unwasm/plugin"
import type {Plugin as VitePlugin} from "vite"

type Plugin = ReturnType<typeof unwasm>

export function rollupWasm(options?: UnwasmPluginOptions): Plugin {
	return unwasm({
		esmImport: true,
		lazy: true,
		...options
	})
}

export function sveltekitOG(options?: UnwasmPluginOptions): VitePlugin {
	return {
		name: 'vite-plugin-sveltekit-og',
		config() {
			return {
				build: {
					rollupOptions: {
						plugins: [rollupWasm(options)],
					},
				}
			};
		}
	};
}