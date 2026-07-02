import { ImageResponse } from '@ethercorps/sveltekit-og';
import { resolveFonts } from '@ethercorps/sveltekit-og/fonts';
import type { RequestHandler } from '@sveltejs/kit';
import OG from '$lib/OG.svelte';
import { fonts } from '$lib/utils/helper.js';

// Component: Svelte component → Satori → resvg PNG (rendered per request).
export const GET: RequestHandler = async () => {
	return new ImageResponse(
		OG,
		{ width: 1200, height: 630, format: 'png', fonts: await resolveFonts(fonts) },
		{
			provider: 'Satori · resvg',
			format: 'PNG',
			mode: 'Runtime',
			timestamp: new Date().toISOString()
		}
	);
};
