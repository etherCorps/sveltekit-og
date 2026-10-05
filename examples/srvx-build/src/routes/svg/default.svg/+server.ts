import { satoriTemplateHandler } from '@examples/shared/satori';
import { fonts } from '$lib/utils/helper.js';

// Default: HTML string → Satori SVG (rendered per request).
export const GET = satoriTemplateHandler(fonts, 'svg', {
	provider: 'Satori',
	format: 'SVG',
	mode: 'Runtime'
});
