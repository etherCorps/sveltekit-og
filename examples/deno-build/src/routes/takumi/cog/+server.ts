import { ImageResponse, type TakumiImageResponseOptions } from '@ethercorps/sveltekit-og/takumi';
import type { RequestHandler } from '@sveltejs/kit';
import OG from '$lib/OG.svelte';

// Component: Svelte component → Takumi. `?format=` switches the output format.
export const GET: RequestHandler = async ({ url }) => {
	const format = (url.searchParams.get('format') as TakumiImageResponseOptions['format']) || 'png';
	return new ImageResponse(
		OG,
		{ width: 1200, height: 630, format },
		{
			provider: 'Takumi',
			format: format.toUpperCase(),
			mode: 'Runtime',
			timestamp: new Date().toISOString()
		}
	);
};
