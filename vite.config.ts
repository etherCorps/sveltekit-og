import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import {vitePluginSvelteH2J} from "@ethercorps/svelte-h2j/vite";
import { rollup as wasmPlugin } from "unwasm/plugin"

export default defineConfig({
	plugins: [vitePluginSvelteH2J(), sveltekit()],
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
