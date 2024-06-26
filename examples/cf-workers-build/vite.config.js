import { sveltekit } from '@sveltejs/kit/vite';
import { rollup as wasmPlugin } from 'unwasm/plugin';
import wasm from "vite-plugin-wasm"

const config = {
	plugins: [wasm() ,sveltekit()],
	build: {
		rollupOptions: {
			plugins: [wasmPlugin({
				esmImport: true,
				lazy: true
			})],
			external: ['@ethercorps/svelte-h2j']
		}
	}
};

export default config;
