---
title: Raw HTML
description: How to use raw HTML strings to generate images
section: Usage
priority: 2
---

<script>
    import { Callout } from "@svecodocs/kit";
</script>

## Overview

Sometimes you might prefer using standard HTML files over Svelte components—perhaps for performance, portability, or to decouple the design from the framework.

SvelteKit OG allows you to pass a raw HTML string directly to the `ImageResponse` constructor. By combining this with Vite's `?raw` import suffix, you can load `.html` files and inject data using simple string replacement.

## Guide

In this example, we will recreate the same GitHub card, but using a pure HTML file with placeholders (e.g., `{repo}`) and inline SVGs.

### HTML Template

Create a file named `og.html` alongside your server file. Note that we are using standard `class` attributes for Tailwind. We also use placeholders like `{owner}` which we will replace programmatically.

`src/routes/og/og.html`

```html
<div class="flex flex-col w-full h-full bg-white">
	<div class="flex flex-col w-full h-[96%] px-16 pt-20 pb-10">
		<div class="flex flex-row items-center justify-between w-full h-1/2">
			<div class="flex flex-col w-1/2 items-start">
				<span class="text-gray-800 text-7xl leading-1.5">{owner}/</span>
				<span class="text-7xl font-bold">{repo}</span>
			</div>
			<img class="h-full" src="{logo}" />
		</div>
		<div class="flex flex-row w-[55%] mt-2">
			<span class="text-xl text-gray-600 leading-1.5 tracking-wide">{description}</span>
		</div>
		<div class="flex flex-row items-center justify-between w-full h-1/2">
			<div class="flex flex-row">
				<svg
					xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="w-8 h-8"
				>
					<path d="M18 21a8 8 0 0 0-16 0" />
					<circle cx="10" cy="8" r="5" />
					<path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
				</svg>
				<div class="flex flex-col ml-2">
					<span class="text-gray-950 text-2xl">{contributors}</span>
					<span class="text-gray-600 text-xl">Contributors</span>
				</div>
			</div>
			<div class="flex flex-row">
				<svg
					xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="w-8 h-8"
				>
					<circle cx="12" cy="12" r="10" />
					<circle cx="12" cy="12" r="1" />
				</svg>
				<div class="flex flex-col ml-2">
					<span class="text-gray-950 text-2xl">{open_issues}</span>
					<span class="text-gray-600 text-xl">Issues</span>
				</div>
			</div>
			<div class="flex flex-row">
				<svg
					xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="w-8 h-8"
				>
					<path
						d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
					/>
				</svg>
				<div class="flex flex-col ml-2">
					<span class="text-gray-950 text-2xl">{stars}</span>
					<span class="text-gray-600 text-xl">Stars</span>
				</div>
			</div>
			<div class="flex flex-row">
				<svg
					xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="w-8 h-8"
				>
					<circle cx="12" cy="18" r="3" />
					<circle cx="6" cy="6" r="3" />
					<circle cx="18" cy="6" r="3" />
					<path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9" />
					<path d="M12 12v3" />
				</svg>
				<div class="flex flex-col ml-2">
					<span class="text-gray-950 text-2xl">{forks}</span>
					<span class="text-gray-600 text-xl">Forks</span>
				</div>
			</div>
			<div class="flex flex-row border-2 border-[#57bfbb] p-3 rounded-full">
				<svg
					xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="#57bfbb"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="w-8 h-8"
				>
					<path
						d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
					/>
					<path d="M9 18c-4.51 2-5-2-7-2" />
				</svg>
			</div>
		</div>
	</div>
	<div class="flex flex-row w-full h-7">
		<span class="flex bg-[#3178c6] w-9/12"></span>
		<span class="flex bg-[#f1e05b] w-2/12"></span>
		<span class="flex bg-[#ff3e00] w-1/12"></span>
	</div>
</div>
```

### API Route

In your server endpoint, import the HTML file using the ?raw suffix. This gives you the file content as a string. You can then perform standard string replacement to inject your dynamic data.

<Callout type="note" title="Extras">

In this example, I have dropped the font and GitHub api request in favour of basic example. I have created specific section for [fonts](/docs/utilities/fonts).

</Callout>

`src/routes/og/+server.ts`

```typescript
import { ImageResponse, type ImageResponseOptions } from '@ethercorps/sveltekit-og';
import type { RequestHandler } from './$types';
// 1. Import the HTML file as a raw string
import ogHTML from './og.html?raw';

export const GET: RequestHandler = async ({ url }) => {
	// 2. Get dynamic data (URL params or API fetch)
	const owner = url.searchParams.get('owner') ?? 'etherCorps';
	const repo = url.searchParams.get('repo') ?? 'sveltekit-og';

	// 3. Define the data mapping
	const replaceHolder = {
		'{owner}': owner,
		'{repo}': repo,
		'{description}': 'Dynamic Open Graph Image Generator',
		'{logo}': 'https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png',
		'{contributors}': 12,
		'{forks}': 34,
		'{open_issues}': 5,
		'{stars}': 125
	};

	// 4. Perform String Replacement
	let htmlToRender = ogHTML;
	for (const [key, value] of Object.entries(replaceHolder)) {
		// replaceAll handles multiple occurrences of the same placeholder
		htmlToRender = htmlToRender.replaceAll(key, String(value) || '');
	}

	const imageOptions: ImageResponseOptions = {
		width: 1200,
		height: 630
		// Optional: Add custom fonts here
		// fonts: ...
	};

	// 5. Return the ImageResponse with the processed HTML string
	return new ImageResponse(htmlToRender, imageOptions);
};
```

<Callout type="tip" title="Templating Engines"> 
The example above uses simple JavaScript string replacement. For more complex logic (conditionals, loops), you can process the string using a lightweight templating library like Handlebars or Mustache before passing it to ImageResponse. 
</Callout>

### Preview

<a target="_blank" rel="external" no-referrer="no-referrer" href="https://sveltekit-og.dev/html">
    <img src="/html?owner=etherCorps&repo=sveltekit-og" class="mt-4 rounded-lg" alt="Generated OG Image">
</a>
