import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	plugins: [sveltekit()],
	define: {
		_a: 'undefined'
	},
	build: {
		rollupOptions: {
			external: ["@resvg/resvg-js"]
		}
	},
	optimizeDeps: {
		exclude: [
			"@resvg/resvg-js"
		]
	}
};

export default config;
