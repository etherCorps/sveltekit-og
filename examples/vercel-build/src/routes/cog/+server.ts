import OG from './OG.svelte';
import type { RequestHandler } from '@sveltejs/kit';
import { ImageResponse } from '@ethercorps/sveltekit-og';

export const GET: RequestHandler = async ({fetch}) => {

	const fontFile = await fetch('https://og-playground.vercel.app/inter-latin-ext-700-normal.woff');
	const fontData: ArrayBuffer = await fontFile.arrayBuffer();
	console.log(typeof OG)
	return new ImageResponse(
		OG,
		{
			debug: true,
			height: 250,
			width: 500,
			fonts: [
				{
					name: 'Inter Latin',
					data: fontData,
					weight: 700
				}
			]
		},
		{ text: 'Ready to dive in?', spanText: 'Start your free trial today.' }
	);
};
