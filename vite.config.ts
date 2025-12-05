import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { visualizer } from 'rollup-plugin-visualizer';
import { sveltekitOG } from './src/lib/plugin.js';

export default defineConfig({
	plugins: [sveltekit(), sveltekitOG(), visualizer({
		emitFile: true,
		open: true,
		filename: 'stats.html',
	})],
	build: {
		rollupOptions: {
			external: [/.+\.wasm$/i, /.+\.ttf$/i, /.+\.woff$/i]
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
