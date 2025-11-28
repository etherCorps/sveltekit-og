import SpaceRegularFont from '$lib/assets/fonts/SpaceMono-Regular.ttf';
import SpaceBoldFont from '$lib/assets/fonts/SpaceMono-Bold.ttf';
import type { ImageResponseOptions } from '@ethercorps/sveltekit-og';
import { read } from '$app/server';

export type FontWeight = 'regular' | 'bold';

const fontsUtils: Record<FontWeight, string> = {
	regular: SpaceRegularFont,
	bold: SpaceBoldFont
};

const fontWeight: Record<FontWeight, number> = {
	regular: 400,
	bold: 700
} as const;

const fetchFont = async (weight: FontWeight, file: string) => {
	return {
		data: await read(file).arrayBuffer(),
		name: 'Neon',
		weight: fontWeight[weight],
		style: 'normal'
	};
};

export const fontsData = async () => {
	let fontsData: ImageResponseOptions['fonts'] = [];
	const fontsPromise = [];
	for (const [key, value] of Object.entries(fontsUtils)) {
		fontsPromise.push(fetchFont(key as FontWeight, value));
	}

	const fontsResponse = await Promise.all(fontsPromise);
	fontsData = fontsResponse.filter((font) => font !== undefined) as ImageResponseOptions['fonts'];
	return fontsData;
};
