import type { RequestHandler } from '@sveltejs/kit';
import { ImageResponse } from '@ethercorps/sveltekit-og';
import OG from './OG.svelte';

export const GET: RequestHandler = async () => {
	return new ImageResponse(OG, {
		width: 1200,
		height: 630,
		debug: false
	});
};
