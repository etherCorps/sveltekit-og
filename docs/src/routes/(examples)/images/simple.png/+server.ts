import { ImageResponse } from '@ethercorps/sveltekit-og';
import SimpleCard from '$lib/components/og/simple.svelte';
import type { RequestHandler } from '@sveltejs/kit';

// This is optional, use it if you want to generate OG image at build time.
export const prerender = true;

export const GET: RequestHandler = async () => {
	return new ImageResponse(
		SimpleCard, // ⬅️ Pass the Svelte component here
		{
			width: 1200,
			height: 630
		}
	);
};
