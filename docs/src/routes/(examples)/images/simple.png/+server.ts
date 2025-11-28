import { ImageResponse } from '@ethercorps/sveltekit-og';
import SimpleCard from '$lib/components/og/simple.svelte';
import type { RequestHandler } from '@sveltejs/kit';

export const prerender = true;

export const GET: RequestHandler = async () => {
	return new ImageResponse(
		SimpleCard,
		{
			width: 1200,
			height: 630,
			headers: {
				'Cache-Control': 'no-cache, no-store'
			}
		}
	);
};