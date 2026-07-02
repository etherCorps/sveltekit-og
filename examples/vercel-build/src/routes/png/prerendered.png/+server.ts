import { ImageResponse } from '@ethercorps/sveltekit-og';
import { resolveFonts } from '@ethercorps/sveltekit-og/fonts';
import type { RequestHandler } from '@sveltejs/kit';
import { satoriTemplate } from '$lib/templates.js';
import { fonts } from '$lib/utils/helper.js';

// Pre-rendered: generated once at build time, served as a static PNG.
export const prerender = true;

export const GET: RequestHandler = async () => {
	return new ImageResponse(
		satoriTemplate({
			provider: 'Satori · resvg',
			format: 'PNG',
			mode: 'Prerendered',
			timestamp: new Date().toISOString()
		}),
		{ width: 1200, height: 630, format: 'png', fonts: await resolveFonts(fonts) }
	);
};
