import { unwasm, type UnwasmPluginOptions } from "unwasm/plugin"
import { isNode } from 'std-env';

type Plugin = ReturnType<typeof unwasm>

export function rollupWasm(options?: UnwasmPluginOptions): Plugin {
	return unwasm({
		esmImport: !isNode,
		lazy: true,
		...options
	})
}