import type {RequestHandler} from "@sveltejs/kit";
import {ImageResponse} from "$lib/image-response.js";
import OG from "../../(components)/OG.svelte";
import type { Config } from '@sveltejs/adapter-vercel';

export const config: Config = {
	runtime: 'edge',
	split: true
};



export const GET: RequestHandler = async () => {
	return new ImageResponse(
		OG as any,
		{debug: false, width: 800, height: 400},
		{ text: 'Ready to try sveltekit-og?', spanText: 'I know, took me 2 years to fix this library.' }
	);
};
