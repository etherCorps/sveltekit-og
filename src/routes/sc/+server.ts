import type { RequestHandler } from "@sveltejs/kit";
import { ImageResponse, type ImageResponseOptions } from "$lib/index.js";
import OG from "../(components)/OG.svelte";

export const GET: RequestHandler = async ({ url }) => {
	const format = url.searchParams.get("format") as ImageResponseOptions['format'] || "png";
	return new ImageResponse(
		OG,
		{
			format,
			debug: false,
			width: 800,
			height: 400,
			headers: {
				"Cache-Control": "no-cache, no-store"
			}
		},
		{
			text: "Ready to try sveltekit-og?",
			spanText: "I know, took me 2 years to fix this library.",
		}
	);
};
