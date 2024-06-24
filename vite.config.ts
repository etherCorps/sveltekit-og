import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import {vitePluginSvelteH2J} from "@ethercorps/svelte-h2j/vite";
import { rollup as wasmPlugin } from "unwasm/plugin"
import wasm from "vite-plugin-wasm";

export default defineConfig({
	plugins: [wasm(), vitePluginSvelteH2J(), sveltekit()],
	optimizeDeps: {
		exclude: [
			"@resvg/resvg-wasm"
		]
	},
	build: {
		rollupOptions: {
			plugins: [wasmPlugin({
				esmImport: true,
				lazy: true
			})],
			external: ['@resvg/resvg-wasm'],
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
