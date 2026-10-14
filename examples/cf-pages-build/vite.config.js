import { sveltekit } from '@sveltejs/kit/vite';
import { sveltekitOG } from '@ethercorps/sveltekit-og/plugin';

const config = {
	plugins: [sveltekit(), sveltekitOG()]
};

export default config;
