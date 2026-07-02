import { ImageResponse } from '@ethercorps/sveltekit-og';
import { resolveFonts } from '@ethercorps/sveltekit-og/fonts';
import type { RequestHandler } from '@sveltejs/kit';
import { satoriTemplate } from '$lib/templates.js';
import { fonts } from '$lib/utils/helper.js';

// Pre-rendered: generated once at build time, served as a static SVG.
export const prerender = true;

export const GET: RequestHandler = async () => {
	return new ImageResponse(
		satoriTemplate({
			provider: 'Satori',
			format: 'SVG',
			mode: 'Prerendered',
			timestamp: new Date().toISOString()
		}),
		{ width: 1200, height: 630, format: 'svg', fonts: await resolveFonts(fonts) }
	);
};
