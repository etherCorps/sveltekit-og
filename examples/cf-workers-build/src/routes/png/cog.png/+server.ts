import { satoriComponentHandler } from '@examples/shared/satori';
import { fonts } from '$lib/utils/helper.js';

// Component: Svelte component → Satori → resvg PNG (rendered per request).
export const GET = satoriComponentHandler(fonts, 'png', {
	provider: 'Satori · resvg',
	format: 'PNG',
	mode: 'Runtime'
});
