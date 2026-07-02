import { ImageResponse, type TakumiImageResponseOptions } from '@ethercorps/sveltekit-og/takumi';
import type { RequestHandler } from '@sveltejs/kit';
import { takumiTemplate } from '$lib/templates.js.js';

// Default: HTML string → Takumi. Switch output with `?format=`, e.g.
// /takumi/default?format=webp — supports png (default), jpeg, webp, ico, svg, raw.
export const GET: RequestHandler = async ({ url }) => {
	const format = (url.searchParams.get('format') as TakumiImageResponseOptions['format']) || 'png';
	return new ImageResponse(
		takumiTemplate({
			provider: 'Takumi',
			format: format.toUpperCase(),
			mode: 'Runtime',
			timestamp: new Date().toISOString()
		}),
		{ width: 1200, height: 630, format }
	);
};
