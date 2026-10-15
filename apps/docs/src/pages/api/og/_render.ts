import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { renderImage, GoogleFont, type Engine } from "@ethercorps/sveltekit-og";
import ShadcnOG from "@/components/og/shadcn-og.svelte";

// Per-page OG cards, rendered at build with the package's own root API (the docs
// dogfood the framework-agnostic core). One static route per engine.
const fonts = [
	new GoogleFont("Geist", { weight: 400 }),
	new GoogleFont("Geist", { weight: 600 }),
	new GoogleFont("Geist Mono", { weight: 400 }),
];

export const ogStaticPaths: GetStaticPaths = async () =>
	(await getCollection("docs")).map((entry) => ({
		params: { slug: entry.id },
		props: { title: entry.data.title, description: entry.data.description ?? "" },
	}));

export const ogRoute =
	(engine: Engine): APIRoute =>
	async ({ props }) => {
		try {
			const png = await renderImage(
				ShadcnOG,
				{ engine, width: 1200, height: 630, fonts } as never,
				props as { title: string; description: string }
			);
			return new Response(png as Uint8Array<ArrayBuffer>, { headers: { "Content-Type": "image/png" } });
		} catch (error) {
			// surface the engine's own error in the build log, not just our wrapper
			const e = error as { code?: string; message: string; originalError?: Error };
			console.error(`OG (${engine}) ${e.code}: ${e.message}`, e.originalError?.message, e.originalError?.stack?.split("\n").slice(0, 4).join("\n"));
			throw error;
		}
	};
