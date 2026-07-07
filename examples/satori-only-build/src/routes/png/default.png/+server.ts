import { satoriTemplateHandler } from '@examples/shared/satori';
import { fonts } from '$lib/utils/helper.js';

// Default: HTML string → Satori → resvg PNG (rendered per request).
export const GET = satoriTemplateHandler(fonts, 'png', {
	provider: 'Satori · resvg',
	format: 'PNG',
	mode: 'Runtime'
});
