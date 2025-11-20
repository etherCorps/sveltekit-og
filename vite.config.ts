import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { visualizer } from 'rollup-plugin-visualizer';
import { rollupWasm } from './src/lib/plugin.js';

export default defineConfig({
	plugins: [sveltekit(), visualizer({
		emitFile: true,
		open: true,
		filename: 'stats.html',
	})],
	build: {
		rollupOptions: {
			plugins: [rollupWasm()],
			external: [/.+\.wasm$/i, /.+\.ttf$/i, /.+\.woff$/i]
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
