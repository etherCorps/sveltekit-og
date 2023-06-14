import { join } from 'path'
import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import { partytownVite } from '@builder.io/partytown/utils'

const config: UserConfig = {
	plugins: [sveltekit(),
		partytownVite({
			// `dest` specifies where files are copied to in production
			dest: join(process.cwd(), 'static', '~partytown')
		})
	],
	define: {
		_a: 'undefined'
	},
	build: {
		rollupOptions: {
			external: ['@resvg/resvg-js']
		}
	},
	optimizeDeps: {
		exclude: ['@resvg/resvg-js']
	}
};

export default config;
