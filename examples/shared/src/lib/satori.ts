import { ImageResponse } from "@ethercorps/sveltekit-og";
import { resolveFonts } from "@ethercorps/sveltekit-og/fonts";
import type { RequestHandler } from "@sveltejs/kit";
import OG from "./OG.svelte";
import { satoriTemplate, type TemplateData } from "./templates.js";

type Fonts = Parameters<typeof resolveFonts>[0];
type Meta = Omit<TemplateData, "timestamp">;

const size = { width: 1200, height: 630 } as const;
const stamp = () => new Date().toISOString();

/** HTML template → Satori → PNG/SVG. Pass `fonts` from your runtime's helper. */
export const satoriTemplateHandler =
	(fonts: Fonts, format: "png" | "svg", meta: Meta): RequestHandler =>
	async () =>
		new ImageResponse(satoriTemplate({ ...meta, timestamp: stamp() }), {
			...size,
			format,
			fonts: await resolveFonts(fonts),
		});

/** Svelte component → Satori → PNG/SVG. */
export const satoriComponentHandler =
	(fonts: Fonts, format: "png" | "svg", meta: Meta): RequestHandler =>
	async () =>
		new ImageResponse(
			OG,
			{ ...size, format, fonts: await resolveFonts(fonts) },
			{ ...meta, timestamp: stamp() },
		);
