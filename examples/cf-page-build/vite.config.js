import { sveltekit } from '@sveltejs/kit/vite';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

const config = {
	plugins: [sveltekit()],
	optimizeDeps: {
		esbuildOptions:{
			plugins: [NodeModulesPolyfillPlugin()]
		}
	}
};

export default config;
