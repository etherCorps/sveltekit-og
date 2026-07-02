import { ImageResponse } from '@ethercorps/sveltekit-og';
import { resolveFonts } from '@ethercorps/sveltekit-og/fonts';
import type { RequestHandler } from '@sveltejs/kit';
import { satoriTemplate } from '$lib/templates.js';
import { fonts } from '$lib/utils/helper.js';

// Default: HTML string → Satori SVG (rendered per request).
export const GET: RequestHandler = async () => {
	return new ImageResponse(
		satoriTemplate({
			provider: 'Satori',
			format: 'SVG',
			mode: 'Runtime',
			timestamp: new Date().toISOString()
		}),
		{ width: 1200, height: 630, format: 'svg', fonts: await resolveFonts(fonts) }
	);
};
