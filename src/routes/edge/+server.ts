import { json, type RequestHandler } from '@sveltejs/kit';
import {ImageResponse} from "$lib/index.js";
import type { Config } from '@sveltejs/adapter-vercel';

export const config: Config = {
	runtime: 'edge',
	split: true,
};

export const GET: RequestHandler = async () => {
	const html = `
<div tw="h-full w-full flex flex-col items-center justify-center bg-white text-sm font-bold">
  <img tw="w-40 h-40" src="https://www.ethercorps.io/logo_transparent.png"/>
  <div style="margin-top: 20px; color: gray">Hello, OGs</div>
  </div>
`.replaceAll('\n', '').trim()

	return new ImageResponse(html, {
		format: 'png',
		debug: false,
		height: 300,
		width: 600,
	})
};
