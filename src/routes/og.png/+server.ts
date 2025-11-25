import { type RequestHandler } from '@sveltejs/kit';
import {ImageResponse} from "$lib/index.js";
import { CustomFont, GoogleFont, resolveFonts } from '$lib/fonts.js';
import RegularFont from "../(components)/SpaceMono-Regular.ttf?url";
import { read } from '$app/server';

const spaceMonoBold = new GoogleFont('Space Mono', {
	weight: 700
});

const customRegular = new CustomFont(
	'Space Mono',
	() => read(RegularFont).arrayBuffer(),
	{ weight: 400 }
);

export const GET: RequestHandler = async () => {
	const html = `
		<div class="h-full w-full flex flex-col items-center justify-center bg-white text-6xl">
  	<img class="h-96 w-96" src="https://www.ethercorps.io/logo_transparent.png"/>
  	<div class="font-bold" style="margin-top: 20px; color: #203649;">Hello, OGs 😳</div>
  	<div class="font-normal" style="margin-top: 20px; color: #203649;">Welcome to unknown</div>
  	</div>
`

	return new ImageResponse(html, {
		format: 'png',
		debug: false,
		height: 600,
		width: 1200,
		fonts: await resolveFonts([spaceMonoBold, customRegular])
	})
};
