import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-vercel 5.x infers the runtime from the local Node and rejects anything
		// outside 18–22; the repo pins Node 24 (.node-version), so name the runtime explicitly.
		adapter: adapter({ runtime: 'nodejs22.x' })
	}
};

export default config;
