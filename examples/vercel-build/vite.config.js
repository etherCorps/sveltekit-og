import { sveltekit } from '@sveltejs/kit/vite';
import { rollup as wasmPlugin } from 'unwasm/plugin';
const config = {
	plugins: [sveltekit()],
	build: {
		rollupOptions: {
			// external: ['@ethercorps/sveltekit-og']
			plugins: [wasmPlugin({
				esmImport: true,
				lazy: true
			})],
		}
	}
};

export default config;
