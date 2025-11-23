import OG from './OG.svelte';
import type { RequestHandler } from '@sveltejs/kit';
import { ImageResponse } from '@ethercorps/sveltekit-og';
import { resolveFonts } from '@ethercorps/sveltekit-og/fonts';
import { fonts } from '../../lib/utils/helper.js';

export const GET: RequestHandler = async ({fetch}) => {
	return new ImageResponse(
		OG,
		{
			debug: false,
			height: 600,
			width: 1200,
			fonts: await resolveFonts(fonts)
		},
		{ text: 'Ready to dive in?', spanText: 'Start your free trial today.' }
	);
};
