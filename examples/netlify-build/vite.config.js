import { sveltekit } from '@sveltejs/kit/vite';
import { rollupWasm } from '@ethercorps/sveltekit-og/plugin';
const config = {
	plugins: [sveltekit()],
	build: {
		rollupOptions: {
			// esmImport: false inlines the wasm as base64 instead of emitting a
			// `.wasm` chunk, so netlify's esbuild bundler never needs a wasm loader.
			plugins: [rollupWasm({ esmImport: false })]
		}
	}
};

export default config;
