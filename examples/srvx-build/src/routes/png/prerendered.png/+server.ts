import { satoriTemplateHandler } from '@examples/shared/satori';
import { fonts } from '$lib/utils/helper.js';

// Pre-rendered: generated once at build time, served as a static PNG.
export const prerender = true;

export const GET = satoriTemplateHandler(fonts, 'png', {
	provider: 'Satori · resvg',
	format: 'PNG',
	mode: 'Prerendered'
});
