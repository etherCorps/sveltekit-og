import { sveltekit } from '@sveltejs/kit/vite';

const config = {
	plugins: [sveltekit()],
	build: {
		rollupOptions:{
			external: ["@ethercorps/sveltekit-og"],
		}
	}
};

export default config;
