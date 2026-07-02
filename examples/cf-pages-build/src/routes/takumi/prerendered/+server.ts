import { ImageResponse } from '@ethercorps/sveltekit-og/takumi';
import type { RequestHandler } from '@sveltejs/kit';
import { takumiTemplate } from '$lib/templates.js';

// Pre-rendered: generated once at build time. Prerendered output can't vary by
// query, so this one is a fixed PNG.
export const prerender = true;

export const GET: RequestHandler = async () => {
	return new ImageResponse(
		takumiTemplate({
			provider: 'Takumi',
			format: 'PNG',
			mode: 'Prerendered',
			timestamp: new Date().toISOString()
		}),
		{ width: 1200, height: 630, format: 'png' }
	);
};
