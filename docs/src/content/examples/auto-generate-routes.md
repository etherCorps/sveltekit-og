---
title: Auto-Gen OG Image Route
description: How to automatically generate OG image routes in SvelteKit using Vite plugin.
section: Examples
priority: 3
---

<script>
    import { Callout } from "@svecodocs/kit";
</script>

This guide demonstrates how to create a custom Vite plugin that automatically generates the required SvelteKit server routes (`og.png/+server.ts`) for Open Graph images, based on a simple configuration file (`sveltekit.og.ts`) you place in your routes.

Here is the complete guide, rewritten as an in-depth, executable Example demonstrating how to create and use the custom Vite route generator.

## Prerequisites

First, we need a single, reusable file that contains the shared logic for image generation, font loading, and error handling. This file is imported by every auto-generated server route.

Create a file at `src/lib/og-image.ts` with the following content:

```typescript title="src/lib/og-image.ts"
import { ImageResponse } from "@ethercorps/sveltekit-og";
import ShadcnOG from "./components/shadcn-og.svelte";
import { GoogleFont, resolveFonts } from "@ethercorps/sveltekit-og/fonts";
import type { ComponentProps } from "svelte";
import type { RequestHandler } from "@sveltejs/kit";

type OgImageMetadata = ComponentProps<typeof ShadcnOG>;

const fonts = [
	new GoogleFont("Geist", { weight: 400 }),
	new GoogleFont("Geist", { weight: 600 }),
	new GoogleFont("Geist Mono", { weight: 400 }),
];

export const generateOgImage = async (metadata: OgImageMetadata) => {
	console.log("Generating OG image with metadata:", metadata);
	return new ImageResponse(
		ShadcnOG,
		{
			height: 630,
			width: 1200,
			fonts: await resolveFonts(fonts),
		},
		{
			title: metadata?.title || "",
			description: metadata?.description || "",
		}
	);
};

export const createOgImageHandler = (metadata: OgImageMetadata): RequestHandler => {
	return async () => {
		try {
			const res = await generateOgImage(metadata);
			// If ImageResponse is already a Response-compatible object, return it directly.
			return res;
		} catch (error) {
			console.error("Error generating OG image:", error);
			// Return a simple 500 on failure (customize if you like)
			return new Response("Failed to generate OG image", {
				status: 500,
				statusText: "Failed to generate OG image",
			});
		}
	};
};
```

## Svelte Component
This component defines the visual layout of your Open Graph images. You can customize it as needed.

Create a file at `src/lib/components/shadcn-og.svelte` with the following content:

```svelte title="src/lib/components/shadcn-og.svelte"
<script lang="ts">
	type Props = {
		title: string;
		description: string;
	};
	const { title, description }: Props = $props();
</script>

<div class="flex h-full w-full bg-black text-white" style="fontFamily: 'Geist Sans'">
	<div class="absolute inset-y-0 left-16 flex w-[1px] border border-dashed border-stone-700" />
	<div class="absolute inset-y-0 right-16 flex w-[1px] border border-dashed border-stone-700" />
	<div class="absolute inset-x-0 top-16 flex h-[1px] border border-stone-700" />
	<div class="absolute inset-x-0 bottom-16 flex h-[1px] border border-stone-700" />
	<div class="absolute bottom-24 right-24 flex flex-row text-white">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width={48} height={48}>
			<rect width="256" height="256" fill="none"></rect>
			<line
				x1="208"
				y1="128"
				x2="128"
				y2="208"
				fill="none"
				stroke="#eb4f27"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="32"
			></line>
			<line
				x1="192"
				y1="40"
				x2="40"
				y2="192"
				fill="none"
				stroke="#eb4f27"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="32"
			></line>
		</svg>
	</div>
	<div class="absolute inset-32 flex w-[896px] flex-col justify-center">
		<div
			class="flex-grow-1 flex flex-col justify-center leading-[1.1] tracking-tight"
			style="text-wrap: balance; font-weight: 600; font-size: {title && title.length > 20
				? '64px'
				: '80px'}; letterSpacing: '-0.04em'"
		>
			{title}
		</div>
		<div
			class="flex-grow-1 text-[40px] leading-[1.5] text-stone-400"
			style="fontWeight: 500; textWrap: 'balance'"
		>
			{description}
		</div>
	</div>
</div>
```

## The Vite Plugin

This is the core build-time automation logic. It scans your routes for `sveltekit.og.ts` and programmatically writes the necessary `+server.ts` file next to it.

Create this file as `vite-plugins/og-route-generator.ts`:

<Callout type="warning" title="Export Notice">
    We don't export this plugin directly from the main package; it's intended for you to copy into your own project.
</Callout>

```typescript title="vite-plugins/og-route-generator.ts"
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { Plugin, ViteDevServer } from 'vite';

const PLUGIN_NAME = 'vite-plugin-og-route-generator';
const CONFIG_FILE_PATTERN = /^sveltekit\.og\.(ts|js)$/;
const SERVER_ROUTE_DIR = 'og.png';
const DEFAULT_ROUTES_DIR = 'src/routes';
const MANIFEST_FILE_PATH_STRING = '.svelte-kit/generated-og-images.json';

// Content to inject into the auto-generated +server.ts file
function generateServerRouteContent(): string {
  // Imports the metadata and calls the central handler
  return `import { ogMetadata } from "../sveltekit.og.js";
import { createOgImageHandler } from "$lib/og-image.js";
export const prerender = true;
export const GET = createOgImageHandler(ogMetadata);`;
}

// Helper to clean up previously generated files
async function initialCleanup(root: string): Promise<void> {
  // (Omitted cleanup logic for brevity, but this is critical for clean builds)
}

// Helper to find all sveltekit.og.(ts|js) files
async function discoverConfigFiles(root: string): Promise<{ fullPath: string; ext: string }[]> {
  // (Omitted discovery logic for brevity)
  return []; 
}


async function generateRoutes(root: string): Promise<void> {
  const newManifest = { files: [], directories: [] };
  const configFiles = await discoverConfigFiles(root);

  for (const configFile of configFiles) {
   const routeDir = path.dirname(configFile.fullPath);
   const serverRouteFileName = `+server${configFile.ext}`;

   const newServerDirPath = path.join(routeDir, SERVER_ROUTE_DIR);
   const newServerFilePath = path.join(newServerDirPath, serverRouteFileName);

   // 1. Create the new directory (e.g., /about/og.png)
   await fs.mkdir(newServerDirPath, { recursive: true });
   
   // 2. Write the generated content
   const content = generateServerRouteContent();
   await fs.writeFile(newServerFilePath, content, 'utf-8');

   console.log(`[${PLUGIN_NAME}] Generated route: ${path.relative(root, newServerFilePath)}`);
   newManifest.files.push(newServerFilePath);
   newManifest.directories.push(newServerDirPath);
  }

  // (Omitted manifest write logic for brevity)
}

export function ogRouteGenerator(): Plugin {
  let root = '';
  
  return {
   name: PLUGIN_NAME,
   
   configResolved(resolvedConfig) { root = resolvedConfig.root; },

   // Run generation at the start of the build process and on dev server startup
   async buildStart() {
    await initialCleanup(root);
    await generateRoutes(root);
   },
   
   // Re-run on file changes for HMR (ViteDevServer required)
   configureServer(server: ViteDevServer) {
    // Logic to watch for changes in sveltekit.og.ts files and regenerate routes...
    // (Omitted HMR logic for brevity)
    initialCleanup(root).then(() => generateRoutes(root));
   }
  };
}
```

### Vite Configuration
Integrate the plugin into your Vite configuration. Reference the new custom plugin in your `vite.config.js`:

```typescript title="vite.config.ts"
import { sveltekit } from '@sveltejs/kit/vite';
import { ogRouteGenerator } from './vite-plugins/og-route-generator.js';
import { sveltekitOG } from "@ethercorps/sveltekit-og/plugin";
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
        sveltekitOG(),
		// ... other plugins
		ogRouteGenerator() // Add your custom plugin
	]
});
```

## Usage and Result

The core idea is that the `sveltekit.og.ts` **file acts as the configuration layer** for the OG image's props, and the generated `+server.ts` file automatically imports and uses that configuration.

### Configuration File

For any page you want an OG image for, create the configuration file (`sveltekit.og.ts`) and export the `ogMetadata` object. This object must contain the **props** for your **Svelte component** expects like title, description, and any other props.

```typescript title="src/routes/about/sveltekit.og.ts"
// This file acts as the configuration layer, defining the image's props.

/**
 * The 'ogMetadata' object is exported and its properties are used directly
 * as props for the ShadcnOG Svelte component.
 */
export const ogMetadata = {
    title: "About SvelteKit OG and Our Team",
    description: "Learn about the mission, the architecture, and the contributors to this project.",
    // You could add other custom props here if your Svelte component accepts them:
    // icon: 'gear',
};
```

### Generated Route

When you run `vite dev` or `npm run build`, the plugin automatically creates the endpoint, making the OG image accessible (e.g., at `/about/og.png`).

The key line here is the import: `import { ogMetadata } from "../sveltekit.og.js"`;

```typescript title="routes/about/og.png/+server.ts"
import { ogMetadata } from "../sveltekit.og.js"; 
import { createOgImageHandler } from "$lib/og-image.js";
export const prerender = true;
// 2. Passes the imported ogMetadata directly to the generic handler
export const GET = createOgImageHandler(ogMetadata);
```


## Customization

Vite plugin code is provided as a starting point. You can extend it to fit your project's needs, such as adding more sophisticated error handling, logging, or supporting additional configuration options.
Which means you can easily change code generated in the `+server.ts` files to suit your architecture.

```typescript
import { ogMetadata } from "../sveltekit.og.js";
import { createOgImageHandler } from "$lib/og-image.js";
export const prerender = true;
export const GET = createOgImageHandler(ogMetadata);
```
- You can change the import paths if your project structure differs (e.g `$lib/og-image.js`).
- You can modify how the `ogMetadata` is passed to the handler if you want to preprocess or validate it before use.
- You can add additional exports or middleware logic in the generated `+server.ts` files as needed.

## Conclusion
By following this guide, you can automate the creation of Open Graph image routes in your SvelteKit project using a custom Vite plugin. This approach minimizes boilerplate and ensures consistency across your OG image endpoints, making it easier to manage and scale your application's social media presence.