import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { sveltekitOG } from '@ethercorps/sveltekit-og/plugin';

const config = { plugins: [sveltekit({ adapter: adapter() }), sveltekitOG()] };

export default config;
