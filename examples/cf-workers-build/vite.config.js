import { sveltekit } from '@sveltejs/kit/vite';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';


const config = {
	plugins: [sveltekit()],
	optimizeDeps: {
		esbuildOptions: {
			define: {
				global: 'globalThis'
			},
			plugins: [NodeModulesPolyfillPlugin()]
		}
	},
	build: {
		rollupOptions: {
			plugins: [rollupNodePolyFill()]
		}
	}
};

export default config;
