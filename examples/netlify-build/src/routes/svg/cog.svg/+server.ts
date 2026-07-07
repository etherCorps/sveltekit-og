import { satoriComponentHandler } from '@examples/shared/satori';
import { fonts } from '$lib/utils/helper.js';

// Component: Svelte component → Satori SVG (rendered per request).
export const GET = satoriComponentHandler(fonts, 'svg', {
	provider: 'Satori',
	format: 'SVG',
	mode: 'Runtime'
});
