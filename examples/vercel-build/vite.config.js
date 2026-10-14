import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { sveltekitOG } from '@ethercorps/sveltekit-og/plugin';

// adapter-vercel 5.x infers the runtime from the local Node and rejects anything
// outside 18–22; the repo pins Node 24 (.node-version), so name the runtime explicitly.
const config = {
	plugins: [sveltekit({ adapter: adapter({ runtime: 'nodejs22.x' }) }), sveltekitOG()]
};

export default config;
