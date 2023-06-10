import OG from './OG.svelte';
import { componentToImageResponse } from '$lib';
import type { RequestHandler } from '@sveltejs/kit';

const fontFile = await fetch(
	'https://raw.githubusercontent.com/etherCorps/sveltekit-og/main/static/inter-latin-ext-700-normal.woff'
);
const fontData: ArrayBuffer = await fontFile.arrayBuffer();

export const GET: RequestHandler = async () => {
	return await componentToImageResponse(
		OG,
		{ text: 'Ready to dive in?', spanText: 'Start your free trial today.' },
		{
			height: 250,
			width: 500,
			fonts: [
				{
					name: 'Inter Latin',
					data: fontData,
					weight: 700
				}
			]
		}
	);
};
