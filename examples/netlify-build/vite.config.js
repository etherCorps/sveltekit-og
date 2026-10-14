import adapter from '@sveltejs/adapter-netlify';
import { sveltekit } from '@sveltejs/kit/vite';
import { sveltekitOG } from '@ethercorps/sveltekit-og/plugin';

const config = {
	// esmImport: false inlines the wasm as base64 instead of emitting a
	// `.wasm` chunk, so netlify's esbuild bundler never needs a wasm loader.
	plugins: [
		sveltekit({
			adapter: adapter({
				edge: false,
				split: true
			})
		}),
		sveltekitOG({ esmImport: false })
	]
};

export default config;
