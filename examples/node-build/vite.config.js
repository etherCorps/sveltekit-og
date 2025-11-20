import { sveltekit } from '@sveltejs/kit/vite';
import { rollupWasm } from '@ethercorps/sveltekit-og/plugin';

const config = {
	plugins: [sveltekit()],
	build: {
		rollupOptions:{
			plugins: [rollupWasm()]
		}
	}
};

export default config;
