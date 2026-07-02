import { ImageResponse } from '@ethercorps/sveltekit-og';
import { resolveFonts } from '@ethercorps/sveltekit-og/fonts';
import type { RequestHandler } from '@sveltejs/kit';
import { satoriTemplate } from '$lib/templates';
import { fonts } from '$lib/utils/helper';

// Default: HTML string → Satori → resvg PNG (rendered per request).
export const GET: RequestHandler = async () => {
	return new ImageResponse(
		satoriTemplate({
			provider: 'Satori · resvg',
			format: 'PNG',
			mode: 'Runtime',
			timestamp: new Date().toISOString()
		}),
		{ width: 1200, height: 630, format: 'png', fonts: await resolveFonts(fonts) }
	);
};
