import type { APIRoute } from "astro";
import { createImage, GoogleFont, type Engine } from "@ethercorps/sveltekit-og";
import OG from "@examples/shared/og";

// The deploy pages show what every example app's `/png/cog.png` route renders: the
// shared OG.svelte from examples/shared, rendered here at build by the same engine.
// (Hotlinking the live deployments is fragile — Chromium blocks cross-origin images
// the moment a host answers with anything but an image.)
export const prerender = true;

const fonts = [
	new GoogleFont("JetBrains Mono", { weight: 400 }),
	new GoogleFont("JetBrains Mono", { weight: 500 }),
	new GoogleFont("JetBrains Mono", { weight: 700 }),
];

export const adapterPreview =
	(engine: Engine, provider: string): APIRoute =>
	() =>
		createImage(
			OG,
			{ engine, width: 1200, height: 630, fonts } as never,
			{ provider, format: "PNG", mode: "Prerendered", timestamp: new Date().toISOString() }
		);
