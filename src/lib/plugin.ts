import { unwasm, type UnwasmPluginOptions } from "unwasm/plugin"

type Plugin = ReturnType<typeof unwasm>

export function rollupWasm(options?: UnwasmPluginOptions): Plugin {
	return unwasm({
		esmImport: true,
		lazy: true,
		...options
	})
}