---
title: Pre-render OG images for docs
description: Guide to pre-rendering Open Graph images for documentation app (svecodocs).
section: Examples
priority: 2
---

This example demonstrates how to implement highly efficient, pre-rendered Open Graph images for a documentation site (like [Svecodocs](https://docs.sveco.dev/docs)). We use a complex component design with nested logic, custom fonts, and SvelteKit's built-in prerender feature.

## File Structure

This structure nests the image endpoint directly within the documentation route (`/docs/doc/[...slug]`), resulting in clean URLs for OG image like `/docs/components/button/og.png`.

```plaintext
/src
├── /lib
│   ├── /utils
│   │   └── docs.ts      <- Utility to load all doc metadata
│   └── /components
│       ├── og.svelte    <- OG image component
│       └── logo-icon.svelte <- Logo component
└── /routes
    └── /(docs)
        └── /doc
            └── /[...slug]
                └── og.png       <- Endpoint directory
                    └── +server.ts   <- Prerendering logic
```

## OG Image Component

This simple template uses inline styles and dynamic property logic to create a distinct, clean design suitable for documentation pages.

### Logo Component

```svelte title="logo-icon.svelte" showLineNumbers
<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	export type Attrs = SVGAttributes<SVGSVGElement>;

	type Props = {
		class?: string;
		color?: string;
		size?: number;
		strokeWidth?: number;
		absoluteStrokeWidth?: boolean;
		startColor?: string;
		endColor?: string;
	};

	const {
		class: className,
		color = 'currentColor',
		size = 140,
		strokeWidth = 2,
		absoluteStrokeWidth = false,
		startColor = '#FC7421',
		endColor = '#FEBC5A',
		...props
	}: Attrs & Props = $props();
</script>

<svg
	{...props}
	width={size}
	height={size}
	viewBox="0 0 140 140"
	fill="none"
	stroke={color}
	xmlns="http://www.w3.org/2000/svg"
	stroke-width={absoluteStrokeWidth ? (Number(strokeWidth) * 24) / Number(size) : strokeWidth}
	class={[className]}
>
	<path
		d="M121.586 37.1263C128.278 41.7525 133.508 48.1942 136.661 55.693C139.814 63.1917 140.76 71.4353 139.385 79.4532C138.011 87.471 134.374 94.9293 128.904 100.95C123.433 106.97 116.356 111.303 108.506 113.436C105.16 114.329 101.612 114.093 98.4128 112.766C95.2136 111.438 92.5411 109.094 90.8091 106.094C89.077 103.095 88.3822 99.6078 88.8318 96.1735C89.2814 92.7392 90.8506 89.5489 93.2964 87.0964L105.417 74.9664C110.495 69.9165 114.437 63.8421 116.983 57.1481C119.528 50.4541 120.616 43.2944 120.176 36.1464C120.616 36.4664 121.106 36.7863 121.586 37.1263Z"
		fill="url(#paint0_linear_8_720)"
	/>
	<path
		d="M37.1265 18.3964C41.7558 11.709 48.1987 6.48282 55.6973 3.33272C63.1958 0.182621 71.4381 -0.760388 79.4543 0.614703C87.4706 1.98979 94.9274 5.62576 100.948 11.0948C106.968 16.5639 111.3 23.6385 113.436 31.4864C114.336 34.8347 114.105 38.3861 112.78 41.5899C111.455 44.7938 109.11 47.471 106.109 49.2064C103.108 50.9418 99.6178 51.6384 96.1802 51.1882C92.7426 50.738 89.5497 49.1661 87.0964 46.7164L74.9763 34.5964C69.9168 29.5322 63.8407 25.5989 57.1489 23.0564C50.4572 20.5138 43.3023 19.4197 36.1565 19.8464C36.4665 19.3664 36.7965 18.8764 37.1265 18.3964Z"
		fill="url(#paint1_linear_8_720)"
	/>
	<path
		d="M18.3964 102.856C11.709 98.2271 6.48282 91.7842 3.33272 84.2856C0.182621 76.787 -0.760388 68.5448 0.614703 60.5285C1.98979 52.5122 5.62563 45.0554 11.0947 39.0353C16.5637 33.0152 23.6384 28.6823 31.4863 26.5464C34.8381 25.6311 38.3985 25.8506 41.6125 27.1707C44.8265 28.4907 47.5135 30.8371 49.2544 33.844C50.9952 36.8509 51.6922 40.3493 51.2368 43.7938C50.7813 47.2383 49.1989 50.4353 46.7363 52.8864L34.6164 65.0064C32.9555 66.6739 31.4086 68.4512 29.9863 70.3264C22.7321 79.9359 19.1438 91.8179 19.8664 103.836C19.3764 103.516 18.8864 103.196 18.3964 102.856Z"
		fill="url(#paint2_linear_8_720)"
	/>
	<path
		d="M102.867 121.586C98.2381 128.277 91.7947 133.506 84.2948 136.658C76.7949 139.81 68.5506 140.754 60.5323 139.379C52.514 138.003 45.0554 134.366 39.0345 128.895C33.0136 123.424 28.681 116.347 26.5465 108.496C25.6366 105.145 25.86 101.586 27.1822 98.3743C28.5044 95.1627 30.851 92.4782 33.857 90.7385C36.863 88.9988 40.3599 88.3015 43.8033 88.755C47.2467 89.2086 50.4436 90.7876 52.8966 93.2464L65.0164 105.366C66.6766 107.035 68.4546 108.583 70.3365 109.996C79.9401 117.255 91.8206 120.844 103.837 120.116C103.527 120.606 103.197 121.106 102.867 121.586Z"
		fill="url(#paint3_linear_8_720)"
	/>
	<defs>
		<linearGradient
			id="paint0_linear_8_720"
			x1="88.6985"
			y1="75.0572"
			x2="139.999"
			y2="75.0572"
			gradientUnits="userSpaceOnUse"
		>
			<stop stop-color={startColor} />
			<stop offset="1" stop-color={endColor} />
		</linearGradient>
		<linearGradient
			id="paint1_linear_8_720"
			x1="36.1565"
			y1="25.6608"
			x2="113.975"
			y2="25.6608"
			gradientUnits="userSpaceOnUse"
		>
			<stop stop-color={startColor} />
			<stop offset="1" stop-color={endColor} />
		</linearGradient>
		<linearGradient
			id="paint2_linear_8_720"
			x1="0"
			y1="64.9134"
			x2="51.3726"
			y2="64.9134"
			gradientUnits="userSpaceOnUse"
		>
			<stop stop-color={startColor} />
			<stop offset="1" stop-color={endColor} />
		</linearGradient>
		<linearGradient
			id="paint3_linear_8_720"
			x1="25.9963"
			y1="114.307"
			x2="103.837"
			y2="114.307"
			gradientUnits="userSpaceOnUse"
		>
			<stop stop-color={startColor} />
			<stop offset="1" stop-color={endColor} />
		</linearGradient>
	</defs>
</svg>
```

### OG Image Component

This component receives the title and description from the server and dynamically adjusts the font size based on the title length for optimal display.

```svelte title="og.svelte" showLineNumbers
<script lang="ts">
	import LogoIcon from './logo-icon.svelte';

	type Props = {
		title: string;
		description: string;
	};

	const { title, description }: Props = $props();
</script>

<div class="flex h-full w-full bg-black text-white" style="fontFamily: 'Geist Sans'">
	<div class="flex border absolute border-stone-700 border-dashed inset-y-0 left-16 w-[1px]" />
	<div class="flex border absolute border-stone-700 border-dashed inset-y-0 right-16 w-[1px]" />
	<div class="flex border absolute border-stone-700 inset-x-0 h-[1px] top-16" />
	<div class="flex border absolute border-stone-700 inset-x-0 h-[1px] bottom-16" />

	<div class="flex absolute flex-row bottom-24 right-24 text-white">
		<LogoIcon width={48} size={48} startColor="#d4d4d4" endColor="#a8a29e" />
	</div>

	<div class="flex flex-col absolute w-[896px] justify-center inset-32">
		<div
			class="tracking-tight flex-grow-1 flex flex-col justify-center leading-[1.1]"
			style="text-wrap: balance; font-weight: 600; font-size: {title && title.length > 20
				? '64px'
				: '80px'}; letterSpacing: '-0.04em'"
		>
			{title}
		</div>
		<div
			class="text-[40px] leading-[1.5] flex-grow-1 text-stone-400"
			style="fontWeight: 500; textWrap: 'balance'"
		>
			{description}
		</div>
	</div>
</div>
```

## Server Endpoint

The server endpoint imports all documentation metadata, matches the requested slug to find the relevant title and description, and pre-renders the OG image using the `ImageResponse` class.

```typescript title="+server.ts" showLineNumbers
import type { RequestHandler } from '@sveltejs/kit';
import { ImageResponse } from '@ethercorps/sveltekit-og';
import { GoogleFont, resolveFonts } from '@ethercorps/sveltekit-og/fonts';
import OgComponent from '$lib/components/og.svelte'; // The main component
import type { EntryGenerator } from './$types';
import { getAllDocs, getDocMetadata } from '$lib/utils/docs.js'; // Data utility imports

// 1. Define the fonts to load
const fonts = [
	// These fonts will be fetched and cached globally
	new GoogleFont('Geist', { weight: 400 }),
	new GoogleFont('Geist', { weight: 600 }),
	new GoogleFont('Geist Mono', { weight: 400 })
];

// 2. Enable prerendering
export const prerender = true;

/**
 * entryGenerator: Tells SvelteKit which documentation pages need an image built.
 * It iterates over all documentation files found by the data utility.
 */
export const entries: EntryGenerator = async () => {
	// Use data utility to retrieve all slugs
	return getAllDocs().map((doc) => ({
		// The slug must be in the format required by the route's dynamic segment
		slug: doc.slug
	}));
};

export const GET: RequestHandler = async ({ params }) => {
	// 3. Fetch the specific metadata for the current slug
	const metadata = getDocMetadata(params.slug);

	// Handle 404/Missing Data
	if (!metadata) {
		return new Response(null, { status: 404 });
	}

	// 4. Resolve the fonts (cache will be hit after the first run)
	const resolvedFonts = await resolveFonts(fonts);

	// 5. Return the ImageResponse
	return new ImageResponse(
		OgComponent,
		{
			height: 630,
			width: 1200,
			fonts: resolvedFonts,
			// Aggressive Caching for static built files
			headers: {
				'Cache-Control': 'public, immutable, max-age=31536000'
			}
		},
		{
			// Pass dynamic data to the Svelte component's props
			title: metadata.title || 'Sveltekit OG',
			description: metadata.description || 'Dynamic OG, easy...'
		}
	);
};
```

Now, when you build your SvelteKit app, OG images for each documentation page will be pre-rendered and saved as static images, ensuring fast load times and reduced server overhead.
