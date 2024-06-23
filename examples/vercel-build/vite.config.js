import { sveltekit } from '@sveltejs/kit/vite';
import wasm from 'vite-plugin-wasm';
import { vitePluginSvelteH2J } from '@ethercorps/svelte-h2j/vite';
import { rollup as wasmPlugin } from 'unwasm/plugin';

const config = {
	plugins: [wasm(), vitePluginSvelteH2J(), sveltekit()],
	build: {
		rollupOptions: {
			plugins: [wasmPlugin({
				esmImport: true,
				lazy: true
			})],
		}
	}
};

export default config;
