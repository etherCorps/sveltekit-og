import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import {vitePluginSvelteH2J} from "@ethercorps/svelte-h2j/vite"

export default defineConfig({
	plugins: [vitePluginSvelteH2J(), sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
