import OG from './OG.svelte';
import type { RequestHandler } from '@sveltejs/kit';
import { componentToImageResponse } from '@ethercorps/sveltekit-og';

const fontFile = await fetch('https://og-playground.vercel.app/inter-latin-ext-700-normal.woff');
const fontData: ArrayBuffer = await fontFile.arrayBuffer();

export const GET: RequestHandler = async () => {
	return componentToImageResponse(
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
