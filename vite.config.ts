import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { rollup as wasmPlugin } from "unwasm/plugin"
import wasm from "vite-plugin-wasm";
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
	plugins: [wasm(), sveltekit(), visualizer({
		emitFile: true,
		open: true,
		filename: 'stats.html',
	})],
	build: {
		rollupOptions: {
			plugins: [wasmPlugin({
				esmImport: true,
				lazy: true
			})],
			external: [/.+\.wasm$/i, /.+\.ttf$/i, /.+\.woff$/i]
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
