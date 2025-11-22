import { defineSiteConfig } from "@svecodocs/kit";

export const siteConfig = defineSiteConfig({
	name: "Sveltekit OG",
	url: "https://sveltekit-og.dev",
	ogImage: {
		url: "https://sveltekit-og.dev/api/og.png",
		height: "630",
		width: "1200",
	},
	description: "Documentation for Sveltekit OG",
	author: "theetherGit",
	keywords: ["sveltekit", "sveltekit-og", "sveltekit og", "sveltekit images", "sveltekit open graph image"],
	license: {
		name: "MIT",
		url: "https://github.com/etherCorps/sveltekit-og/blob/main/LICENSE",
	},
	links: {
		x: "https://x.com/theether0",
		github: "https://github.com/etherCorps/sveltekit-og",
	},
});
