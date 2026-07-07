import {
	ImageResponse,
	type TakumiImageResponseOptions,
} from "@ethercorps/sveltekit-og/takumi";
import type { RequestHandler } from "@sveltejs/kit";
import OG from "./OG.svelte";
import { takumiTemplate, type TemplateData } from "./templates.js";

type Meta = Omit<TemplateData, "timestamp">;

const size = { width: 1200, height: 630 } as const;
const stamp = () => new Date().toISOString();
const queryFormat = (url: URL): TakumiImageResponseOptions["format"] =>
	(url.searchParams.get("format") as TakumiImageResponseOptions["format"]) || "png";

/** HTML template → Takumi. Output format from `?format=` (png default). */
export const takumiTemplateHandler =
	(meta: Omit<Meta, "format">): RequestHandler =>
	async ({ url }) => {
		const format = queryFormat(url);
		return new ImageResponse(
			takumiTemplate({ ...meta, format: String(format).toUpperCase(), timestamp: stamp() }),
			{ ...size, format },
		);
	};

/** HTML template → Takumi, fixed PNG (for prerendered routes — output can't vary by query). */
export const takumiTemplatePrerenderedHandler =
	(meta: Meta): RequestHandler =>
	async () =>
		new ImageResponse(takumiTemplate({ ...meta, timestamp: stamp() }), {
			...size,
			format: "png",
		});

/** Svelte component → Takumi. Output format from `?format=` (png default). */
export const takumiComponentHandler =
	(meta: Omit<Meta, "format">): RequestHandler =>
	async ({ url }) => {
		const format = queryFormat(url);
		return new ImageResponse(
			OG,
			{ ...size, format },
			{ ...meta, format: String(format).toUpperCase(), timestamp: stamp() },
		);
	};
