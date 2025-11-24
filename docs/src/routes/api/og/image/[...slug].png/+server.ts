import type { RequestHandler } from '@sveltejs/kit';
import { ImageResponse } from '@ethercorps/sveltekit-og';
import { GoogleFont, resolveFonts } from '@ethercorps/sveltekit-og/fonts';
import ShadCnOG from "./shadcn-og.svelte"
import type { EntryGenerator } from './$types';
import { getAllDocs, getDocMetadata } from '$lib/utils';

const fonts = [
	new GoogleFont('Geist', {weight: 400}),
	new GoogleFont('Geist', {weight: 600}),
	new GoogleFont('Geist Mono', {weight: 400}),
]

export const prerender = true;

export const entries: EntryGenerator = async () => {
	return getAllDocs().map((doc) => ({
		slug: `${doc.slug}`,
	}));
};

export const GET: RequestHandler = async ({params}) => {
	const metadata = getDocMetadata(params.slug)
	return new ImageResponse(
		ShadCnOG,
		{
			height: 630,
			width: 1200,
			fonts: await resolveFonts(fonts)
		},
		{
			title: metadata?.title || 'Sveltekit OG',
			description: metadata?.description || 'Dynamic OG, easy...'
		})
}