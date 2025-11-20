import { rollup, type UnwasmPluginOptions } from "unwasm/plugin"

type Plugin = ReturnType<typeof rollup>

export function rollupWasm(options?: UnwasmPluginOptions): Plugin {
	return rollup({
		esmImport: true,
		lazy: true,
		...options
	})
}