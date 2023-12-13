import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import wasm from "vite-plugin-wasm";
import {vitePluginSvelteKitOG} from "@ethercorps/svelte-h2j/vite"

export default defineConfig({
	plugins: [vitePluginSvelteKitOG(), sveltekit(), wasm()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
