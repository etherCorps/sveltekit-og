import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { renderImage, GoogleFont, type Engine } from "@ethercorps/sveltekit-og";
import DocsCard from "@/components/og/docs-card.svelte";

// Per-page OG cards, rendered at build with the package's own root API (the docs
// dogfood the framework-agnostic core). One static route per engine.
const fonts = [
	new GoogleFont("Geist", { weight: 400 }),
	new GoogleFont("Geist", { weight: 600 }),
	new GoogleFont("Geist Mono", { weight: 400 }),
];

// eyebrow from the page's path segment
const SECTIONS: Record<string, string> = {
	guides: "Guides",
	engines: "Engines",
	reference: "Reference",
	deploy: "Deploy",
	examples: "Examples",
	migration: "Migration",
	playground: "Playground",
	benchmarks: "Benchmarks",
	release: "Release",
};

export const ogStaticPaths: GetStaticPaths = async () =>
	(await getCollection("docs")).map((entry) => ({
		params: { slug: entry.id },
		props: {
			title: entry.data.title,
			description: entry.data.description ?? "",
			section: SECTIONS[entry.id.split("/")[1] ?? ""] ?? "Docs",
		},
	}));

export const ogRoute =
	(engine: Engine): APIRoute =>
	async ({ props }) => {
		try {
			const png = await renderImage(
				DocsCard,
				{ engine, width: 1200, height: 630, fonts } as never,
				props as { title: string; description: string; section: string }
			);
			return new Response(png as Uint8Array<ArrayBuffer>, { headers: { "Content-Type": "image/png" } });
		} catch (error) {
			// surface the engine's own error in the build log, not just our wrapper
			const e = error as { code?: string; message: string; originalError?: Error };
			console.error(`OG (${engine}) ${e.code}: ${e.message}`, e.originalError?.message, e.originalError?.stack?.split("\n").slice(0, 4).join("\n"));
			throw error;
		}
	};
