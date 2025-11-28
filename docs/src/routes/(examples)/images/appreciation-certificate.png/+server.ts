import { ImageResponse } from '@ethercorps/sveltekit-og';
import AppreciationCertificate from '$lib/components/og/appreciation-certifcate.svelte';
import type { RequestHandler } from '@sveltejs/kit';
import { CustomFont, GoogleFont, resolveFonts } from '@ethercorps/sveltekit-og/fonts';
import TrajanProBold from "$lib/assets/fonts/trajan-pro/TrajanPro-Bold.otf?url"
import NeoSansProRegular from "$lib/assets/fonts/neo-sans-pro/NeoSansProRegular.OTF?url"
import { read } from '$app/server';

// This is optional, use it if you want to generate OG image at build time.
export const prerender = true;

const fonts = [
	new GoogleFont('Pinyon Script', { weight: 400, name: 'PinyonScript-Regular' }),
	new GoogleFont('Tinos', { weight: 400, name: 'Times New Roman Pro Regular' }),
	new CustomFont('TrajanPro-Bold',
		() => read(TrajanProBold).arrayBuffer(),
		{
			weight: 400,
		}
	),
	new CustomFont('Neo Sans Pro Regular',
		() => read(NeoSansProRegular).arrayBuffer(),
		{
			weight: 400,
		}
	)
];

export const GET: RequestHandler = async () => {
	return new ImageResponse(
		AppreciationCertificate,
		{
			width: 1124,
			height: 794,
			fonts: await resolveFonts(fonts)
		},
		{
			"title": "CERTIFICATE",
			"subtitle": "OF APPRECIATION",
			"text": "This certificate is proudly awarded to",
			"name": "Michael Anderson",
			"description": "This certificate is given to Michael Anderson for his achievement during the month of August 2024. Hopefully this certificate will be a great motivation.",
			"president": "Emmil Johnson",
			"manager": "James Wilson",
		}
	);
};