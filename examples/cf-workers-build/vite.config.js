import { sveltekit } from '@sveltejs/kit/vite';
import { rollup as wasmPlugin } from 'unwasm/plugin';
import wasm from "vite-plugin-wasm"

const config = {
	plugins: [sveltekit()],
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
