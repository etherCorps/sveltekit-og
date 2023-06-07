import { sveltekit } from '@sveltejs/kit/vite';
import nodePolyfills from 'rollup-plugin-node-polyfills';

const config = {
	plugins: [sveltekit()],
	define: {
		_a: 'undefined'
	},
	build: {
		polyfillModulePreload: true,
		rollupOptions: {
			plugins: [nodePolyfills()]
		}
	}
};

export default config;
