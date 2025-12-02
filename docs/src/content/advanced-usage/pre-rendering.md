---
title: Pre-rendering OG Images
description: How to use SvelteKit's pre-rendering Open Graph images for static routes.
section: Advanced Usage
priority: 2
---

<script>
    import { Callout } from "@svecodocs/kit";
</script>

Pre-rendering generates your OG images at build time, not at runtime. This eliminates the serverless function execution cost and latency when a bot first crawls the image, resulting in superior performance and reduced infrastructure costs.

You achieve this using SvelteKit's built-in `prerender` feature on the server route.

<Callout type="note" title="Sveltekit Pre-rendering">

To make a route pre-rendered, you need to export the `prerender` constant and set it to `true` in your server route file (e.g., `+server.ts`).

```typescript
export const prerender = true;
```

</Callout>


## Why Pre-render?
Pre-rendering OG images at build time offers several advantages:
- **Performance**: Images are generated once during the build, resulting in instant delivery to users without server-side rendering delays.
- **Reliability**: Eliminates runtime dependencies and potential failures in image generation.
- **Scalability**: Reduces server load since images are served as static assets.

## Single Static Route

For routes like `/about` or `/landing`, you can force the OG image route to be `pre-rendered` into a static file (e.g., `build/og/image.png`).

#### Example

Let's assume your page is at `/about` and its OG image endpoint is `/about/og.png`.

```typescript showLineNumbers title="about/og.png/+server.ts"
import { ImageResponse } from '@ethercorps/sveltekit-og';
import AboutCard from '$lib/og/AboutCard.svelte';
import type { RequestHandler } from './$types';

// 1. Enable prerendering for this route
export const prerender = true;

export const GET: RequestHandler = async () => {
	// Data is static for the About page
	const props = {
		title: "About Our Project",
		stats: 100
	};

	// 2. ImageResponse generates the static PNG during the build process
	return new ImageResponse(AboutCard, {
		width: 1200,
		height: 630,
		// Set aggressive caching since the image will never change
		headers: {
			'Cache-Control': 'public, immutable, max-age=31536000'
		}
	}, props);
};
```

## Dynamic Paths

This is the standard and most powerful use case. For a `documentation` site, you need to `pre-render` an OG image for every documentation page (`/docs/a`, `/docs/b`, etc.) based on dynamic data you can access during the build.

This requires a dynamic SvelteKit route that implements the `entries` function.

#### Case Study: Sveltekit OG Docs

In the `sveltekit-og` documentation, the OG images for all documentation pages are pre-rendered using an endpoint at `/api/og/image/[...slug].png`.

### Defining Dynamic Entries

The `entries` function is critical. It tells SvelteKit **which dynamic paths** to build. In a documentation site, this means loading your index data and returning an entry for every document.

<Callout type="tip" title="Use File Extensions in Server Routes">

It is highly recommended to append a file extension like `.png` or `.svg` to your dynamic server route, for example: `[...slug].png`. 
Why this helps:
- **Clarity**: It immediately signals that the endpoint returns an image file, not JSON or HTML.
- **Caching**: CDNs and browsers often use the file extension to automatically set the correct **Content-Type** and apply highly aggressive **file caching** strategies, which is essential for performance.

</Callout>

```typescript showLineNumbers title="api/og/image/[...slug].png/+server.ts"
// We use a glob import to get metadata for all markdown files in the documentation directory
import { docFiles } from '$lib/docs/data';
import type { EntryGenerator, RequestHandler } from './$types';

// The function that tells SvelteKit which URLs to pre-render
export const entries: EntryGenerator = () => {
    // 1. Get all documentation file paths
    const slugs = docFiles.map((doc) => doc.slug);

    // 2. Return the required format for SvelteKit: {slug: [...parts]}
    return slugs.map((slug) => ({
        // Converts a slug like '/usage/basic-generation' into the array ['usage', 'basic-generation']
        slug: slug.slice(1).split('/')
    }));
};

// ... (Rest of the file continues with the GET function)
```

### API Handler

The `GET` request handler function then handles two scenarios:
1. **During Build**: SvelteKit calls GET for every entry defined by `entries`. It retrieves the data for that specific document (`params.slug`) and generates the PNG.
2. **At Runtime**: If a new, unlisted path is hit, it will dynamically generate the image (though this is rare for documentation).

```typescript showLineNumbers title="api/og/image/[...slug].png/+server.ts"
import { getDocData } from '$lib/docs/data'; // Utility to fetch doc data by slug
import DocCard from '$lib/og/DocCard.svelte'; // The Svelte Component template
import { resolveFonts } from '$lib/fonts/utils'; 
import { ImageResponse } from '@ethercorps/sveltekit-og';
import type { RequestHandler } from './$types';

// 1. Pre-render is enabled
export const prerender = true;

// ... (entries function from above is here) ...

export const GET: RequestHandler = async ({ params }) => {
    const slug = '/' + params.slug.join('/');
    const docData = getDocData(slug); // Get the title, description, etc. for the markdown file

    if (!docData) {
        // Handle case where the slug doesn't exist
        return new Response(null, { status: 404 });
    }

    const resolvedFonts = await resolveFonts(); // Pre-loaded font data

    const props = {
        title: docData.title,
        description: docData.description,
        // ... other props like section, icon, etc.
    };

    return new ImageResponse(
        DocCard,
        {
            width: 1200,
            height: 630,
            fonts: resolvedFonts,
            // Caching for long-term storage since it's pre-rendered
            headers: {
                'Cache-Control': 'public, immutable, max-age=31536000'
            }
        },
        props
    );
};
```
By setting `prerender = true` and implementing `entries`, every single documentation image is ready before the site is deployed, leading to maximum performance.