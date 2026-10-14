import type { RequestHandler } from "@sveltejs/kit";
import { ImageResponse } from "#lib/index.js";
import OG from "../(components)/OG.svelte";

export const GET: RequestHandler = async ({ url }) => {
	const format = (url.searchParams.get("format") as "png" | "svg") || "png";
	return new ImageResponse(
		OG,
		{
			engine: "satori",
			format,
			debug: false,
			width: 800,
			height: 400,
			headers: {
				"Cache-Control": "no-cache, no-store",
			},
		},
		{
			text: "Ready to try sveltekit-og?",
			spanText: "I know, took me 2 years to fix this library.",
		}
	);
};
