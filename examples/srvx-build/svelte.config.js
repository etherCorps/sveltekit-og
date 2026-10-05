import adapter from '@ethercorps/svelte-adapter-universal';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter()
	}
};

export default config;
