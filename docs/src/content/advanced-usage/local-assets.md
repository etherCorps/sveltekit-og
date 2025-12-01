---
title: Assets Loading
description: Guide to handling local images, SVGs, and remote assets in a SvelteKit server environment.
section: Advanced Usage
priority: 2
---

<script>
	import { Callout, Tabs, TabItem } from "@svecodocs/kit";

    const exampleTabs = ["Svelte Component", "Raw HTML"]
</script>

When generating OG images, the code runs on the server (Node, Edge, or Worker), not in the browser. This means you **cannot** use relative paths (e.g., `<img src="./logo.png">`) because the image generation engine (Satori) has no access to your client-side assets or file system by default.

To use local assets, you must provide the image data as either a **Base64 Data URL** or instruct Satori to fetch it via a **Public Absolute URL**.

## Vite Inline Import

This is the **recommended method** for small, self-contained images (logos, avatars) because it requires no runtime file system access or network requests.

### How it Works

The `?inline` query suffix is a Vite feature that processes the asset at **build time** and exports it as a string containing the Base64 Data URL (`data:image/png;base64,...`). Since this string is available directly in your server-side code, the image generation is highly reliable and fast.

### Example

<Tabs items={exampleTabs}>

<TabItem value="Svelte Component">

```svelte showLineNumbers title="inline-import.svelte"
<script lang="ts">
    // 1. Import the asset using the ?inline suffix (exports a base64 data URL string)
    import myLogoData from '$lib/assets/logo.png?inline';
</script>

<div tw="flex items-center">
    <img src={myLogoData} width="128" height="128" alt="Base64 Logo" />
    <h1>My Base64 Title</h1>
</div>
```
    
</TabItem>

<TabItem value="Raw HTML">

```typescript showLineNumbers title="+server.ts"
import { ImageResponse } from '@ethercorps/sveltekit-og';
// Import the image directly as a Base64 data URL string
import logoDataUrl from '$lib/assets/logo.png?inline';

export const GET = async () => {
	const htmlToRender = `
    <div tw="flex flex-col">
      <img src="${logoDataUrl}" width="128" height="128" />
    </div>
  `;

	return new ImageResponse(htmlToRender, { width: 1200, height: 630 });
};
```

</TabItem>

</Tabs>

## Reading Local Assets

This method is ideal for large assets (e.g., high-resolution background images) or files you need as an `ArrayBuffer` (like custom fonts), where embedding the file with `?inline` is too large.

### How it Works

- The `?url` suffix tells Vite to export the asset's path as a string (e.g., `$lib/assets/logo.png`).
- The SvelteKit utility  `$app/server/read` uses this path to access the asset within the server's build directory and returns the content as a `Response`.
- 
### Example

#### Reading into an ArrayBuffer

```typescript showLineNumbers
import { ImageResponse } from '@ethercorps/sveltekit-og';
// 1. Import the asset path string using ?url
import imagePath from '$lib/assets/large_image.jpg?url';
import { read } from '$app/server'; // 2. Import the server read utility

export const GET = async ({ fetch }) => {
	// 3. Read the content of the asset path using the utility
	const assetResponse = await read(imagePath);
	const imageBuffer = await assetResponse.arrayBuffer();

	// 4. Convert ArrayBuffer to Base64 for Satori's consumption
	const base64Image = Buffer.from(imageBuffer).toString('base64');
	const mimeType = assetResponse.headers.get('content-type') || 'image/jpeg';
	const dataUrl = `data:${mimeType};base64,${base64Image}`;

	const htmlToRender = `
    <div tw="flex">
      <img src="${dataUrl}" width="500" height="500" />
    </div>
  `;

	return new ImageResponse(htmlToRender, { width: 1200, height: 630 });
};
```

## Using Public Absolute Path

This method is the simplest for referencing assets placed in the static folder, but it relies on making an HTTP network request during image generation.

### How it Works

Satori's rendering engine requires a full absolute URL (e.g., `https://example.com/logo.png`) to fetch the image via HTTP. You must construct this URL using the request URL's origin.

### Example

```typescript showLineNumbers title="+server.ts"
import { ImageResponse } from '@ethercorps/sveltekit-og';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	// Construct the absolute URL using the request URL's origin
	// Assumes logo.png is in the static folder
	const absoluteUrl = `${url.origin}/logo.png`;

	const htmlToRender = `
    <div tw="flex">
      <img src="${absoluteUrl}" width="100" height="100" />
    </div>
  `;

	return new ImageResponse(htmlToRender, { width: 1200, height: 630 });
};
```

[//]: # ()
[//]: # (<Callout type="warning" title="Warning for Edge Runtimes"> )

[//]: # (    )
[//]: # (In `Edge Runtimes` &#40;`Cloudflare`, `Vercel Edge`, `Deno`&#41;, using `fetch&#40;&#41;` to retrieve an `asset` from your own server &#40;`url.origin`&#41; can sometimes `slow cold starts`. <br /> )

[//]: # (- Method 1 &#40;`?inline`&#41; or Method 2 &#40;`$app/server/read`&#41; is strongly preferred in these environments.)

[//]: # ()
[//]: # (</Callout>)
