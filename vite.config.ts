import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import {vitePluginSvelteKitOG} from "@ethercorps/svelte-h2j/vite"

export default defineConfig({
	plugins: [vitePluginSvelteKitOG(), sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
