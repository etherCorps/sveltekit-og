import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { sveltekitOG } from '@ethercorps/sveltekit-og/plugin';

const config = {
	plugins: [sveltekit({ adapter: adapter() }), sveltekitOG({ esmImport: false })]
};

export default config;
