import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import {vitePluginSvelteH2J} from "@ethercorps/svelte-h2j/vite";
import { rollup as wasmPlugin } from "unwasm/plugin"
import wasm from "vite-plugin-wasm";
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
	plugins: [wasm(), vitePluginSvelteH2J(), sveltekit(), visualizer({
		emitFile: true
	})],
	optimizeDeps: {
		exclude: [
			// "@ethercorps/svelte-h2j"
		]
	},
	esbuild: {
		// exclude: ['@ethercorps/svelte-h2j']
	},
	build: {
		rollupOptions: {
			plugins: [wasmPlugin({
				esmImport: true,
				lazy: true
			})],
			external: [/.+\.wasm$/i, /.+\.ttf$/i, /.+\.woff$/i, '@ethercorps/svelte-h2j']
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
