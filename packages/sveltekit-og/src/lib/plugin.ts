import { unwasm, type UnwasmPluginOptions } from "unwasm/plugin";
import type { Plugin as VitePlugin } from "vite";

type Plugin = ReturnType<typeof unwasm>;

export function rollupWasm(options?: UnwasmPluginOptions): Plugin {
	return unwasm({
		esmImport: true,
		lazy: true,
		...options,
	});
}

export function sveltekitOG(options?: UnwasmPluginOptions): VitePlugin {
	return {
		name: "vite-plugin-sveltekit-og",
		// run after sveltekit(), whose config hook is what sets build.ssr
		enforce: "post",
		// SSR bundle only: the client build (e.g. the /client entry) loads its wasm
		// through Vite's own asset handling, and unwasm would break that. Vite computes
		// env.isSsrBuild before SvelteKit sets build.ssr, so check the merged config too.
		config(config, { isSsrBuild }) {
			if (!isSsrBuild && !config.build?.ssr) return;
			return {
				build: {
					rollupOptions: {
						plugins: [rollupWasm(options)],
					},
				},
			};
		},
	};
}
