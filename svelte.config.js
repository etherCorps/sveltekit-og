import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: adapter({
		split: true,
	}),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		prerender: {
			handleUnseenRoutes: (details) => {
				console.log('handleUnseenRoutes', JSON.stringify(details, null, 2));
				return;
			},
			handleHttpError: ({ path, message }) => {
				console.log('handleHttpError', path, message);
				// ignore deliberate link to shiny 404 page
				if (path.split('/').length === 2) return;

				if (path.startsWith('/og.png')) return;

				// otherwise fail the build
				throw new Error(message);
			},
			handleMissingId: (details) => {
				console.log('handleMissingId', JSON.stringify(details, null, 2));
				return;
			}
		}
	}
};

export default config;
