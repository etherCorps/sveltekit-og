import { sveltekit } from '@sveltejs/kit/vite';
import {rollup as unwasm} from "unwasm/plugin"
const config = {
	plugins: [sveltekit()],
	build: {
		rollupOptions: {
			// external: ['@ethercorps/sveltekit-og']
			plugins: [unwasm({
				esmImport: true,
				lazy: true
			})],
		}
	}
	// build:{
	// 	rollupOptions: {
	// 		external: ["@ethercorps/sveltekit-og"]
	// 	}
	// }
};

export default config;
