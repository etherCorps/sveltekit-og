import { type RequestHandler } from '@sveltejs/kit';
import {ImageResponse} from "$lib/index.js";

export const GET: RequestHandler = async () => {
    const html = `
		<div tw="h-full w-full flex flex-col items-center justify-center bg-white text-6xl font-bold">
  	<img tw="h-96 w-96" src="https://www.ethercorps.io/logo_transparent.png"/>
  	<div style="margin-top: 20px; color: #203649;">Hello, OGs 😳</div>
  	</div>
`.replaceAll('\n', '').trim()

    return new ImageResponse(html, {
        format: 'png',
        debug: false,
        height: 600,
        width: 1200,
    })
};
