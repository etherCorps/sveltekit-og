import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import {vitePluginSvelteH2J} from "@ethercorps/svelte-h2j/vite";
import { rollup as wasmPlugin } from "unwasm/plugin"
import wasm from "vite-plugin-wasm";

export default defineConfig({
	plugins: [wasm(), vitePluginSvelteH2J(), sveltekit()],
	worker: {
		plugins: [
			wasm()
		]
	},
	// optimizeDeps: {
	// 	exclude: ["@resvg/resvg-wasm", "yoga-wasm-web"],
	// },
	build: {
		rollupOptions: {
			plugins: [wasmPlugin({
				esmImport: true,
				lazy: true
			})],
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
