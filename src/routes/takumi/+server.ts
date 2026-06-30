import type { RequestHandler } from "@sveltejs/kit";
import { ImageResponse, type TakumiImageResponseOptions } from "$lib/takumi/index.js";
import OG from "../(components)/OG.svelte";

export const GET: RequestHandler = async ({ url }) => {
	const format = (url.searchParams.get("format") as TakumiImageResponseOptions["format"]) || "png";
	return new ImageResponse(
		OG,
		{
			format,
			debug: true,
			width: 800,
			height: 400,
			headers: {
				"Cache-Control": "no-cache, no-store",
			},
		},
		{
			text: "Ready to try sveltekit-og?",
			spanText: "Now rendered with Takumi.",
		}
	);
};
