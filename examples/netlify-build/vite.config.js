import { sveltekit } from '@sveltejs/kit/vite';
import {rollup as unwasm} from "unwasm/plugin"
const config = {
	plugins: [sveltekit()],
	build: {
		rollupOptions: {
			plugins: [unwasm({
				esmImport: true,
				lazy: true
			})]
		}
	}
};

export default config;
