import { satoriTemplateHandler } from '@examples/shared/satori';
import { fonts } from '$lib/utils/helper.js';

// Pre-rendered: generated once at build time, served as a static SVG.
export const prerender = true;

export const GET = satoriTemplateHandler(fonts, 'svg', {
	provider: 'Satori',
	format: 'SVG',
	mode: 'Prerendered'
});
