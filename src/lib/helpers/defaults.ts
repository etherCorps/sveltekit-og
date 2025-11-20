import type { SatoriOptions } from 'satori';

import type { ImageOptions } from '../types.js';
import type { EmojiType } from './emoji.js';

export async function default_fonts(): Promise<SatoriOptions['fonts']> {
	const [noto_sans_regular_font_resp, noto_sans_bold_font_reps] = await Promise.all([
		fetch('https://cdn-sveltekit-og.ethercorps.io/NotoSans-Regular.ttf'), fetch('https://cdn-sveltekit-og.ethercorps.io/NotoSans-Bold.ttf')
	])

	if (!(noto_sans_bold_font_reps.ok || noto_sans_bold_font_reps.ok)) {
		console.error('Not able to load default fonts');
		throw new Error('Not able to load default fonts');
	}

	const [noto_sans_regular_font, noto_sans_bold_font] = await Promise.all([noto_sans_regular_font_resp.arrayBuffer(),noto_sans_bold_font_reps.arrayBuffer()]);

	return [
		{
			data: noto_sans_regular_font,
			name: 'Inter',
			weight: 400,
			style: 'normal'
		},
		{
			data: noto_sans_bold_font,
			name: 'Inter',
			weight: 700,
			style: 'normal'
		}
	]
}

export const DEFAULT_FORMAT = 'png';
export const DEFAULT_WIDTH = 1200;
export const DEFAULT_HEIGHT = 630;
export const DEFAULT_EMOJI_PROVIDER: EmojiType = 'twemoji';
export const DEFAULT_STATUS_CODE = 200;
export const DEFAULT_STATUS_TEXT = 'Success';

export const DEFAULT_OPTIONS: ImageOptions = {
	height: DEFAULT_HEIGHT,
	width: DEFAULT_WIDTH,
	debug: false,
	format: DEFAULT_FORMAT,
	emoji: 'twemoji'
}