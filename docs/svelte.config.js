import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsx } from 'mdsx';
import mdsxConfig from './mdsx.config.js';
import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [mdsx(mdsxConfig), vitePreprocess()],
	kit: {
		alias: {
			'$content/*': '.velite/*'
		},
		adapter: adapter(),
		prerender: {
			handleMissingId: 'warn',
			handleHttpError: ({ path, message }) => {
				console.log('handleHttpError', path, message);
				// ignore deliberate link to shiny 404 page
				if (path.split('/').length === 2) return;

				if (path.startsWith('/api/og/image')) return;

				// otherwise fail the build
				throw new Error(message);
			}
		}
	},
	extensions: ['.svelte', '.md']
};

export default config;
