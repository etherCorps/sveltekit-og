import adapter from '@sveltejs/adapter-bun';
import { sveltekit } from '@sveltejs/kit/vite';
import { sveltekitOG } from '@ethercorps/sveltekit-og/plugin';

const config = {
	plugins: [sveltekit({ adapter: adapter() }), sveltekitOG({ esmImport: false })]
};

export default config;
