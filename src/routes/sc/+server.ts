import type { RequestHandler } from "@sveltejs/kit";
import { ImageResponse } from "$lib/index.js";
import OG from "../(components)/OG.svelte";

export const GET: RequestHandler = async () => {
	return new ImageResponse(
		OG,
		{ debug: false, width: 800, height: 400 },
		{
			text: "Ready to try sveltekit-og?",
			spanText: "I know, took me 2 years to fix this library.",
		}
	);
};
