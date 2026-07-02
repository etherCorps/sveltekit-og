import { ImageResponse } from '@ethercorps/sveltekit-og';
import { resolveFonts } from '@ethercorps/sveltekit-og/fonts';
import type { RequestHandler } from '@sveltejs/kit';
import OG from '$lib/OG.svelte';
import { fonts } from '$lib/utils/helper';

// Component: Svelte component → Satori SVG (rendered per request).
export const GET: RequestHandler = async () => {
	return new ImageResponse(
		OG,
		{ width: 1200, height: 630, format: 'svg', fonts: await resolveFonts(fonts) },
		{ provider: 'Satori', format: 'SVG', mode: 'Runtime', timestamp: new Date().toISOString() }
	);
};
