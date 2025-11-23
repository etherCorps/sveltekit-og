---
title: Using Local Assets
description: Guide to hwo to handle assets in a SvelteKit server environment
section: Utilities
---

<script>
	import { Callout } from "@svecodocs/kit";
</script>

When generating OG images, the code runs on the server (Node, Edge, or Worker), not in the browser. This means you cannot use relative paths (e.g., `<img src="./logo.png">`) because the image generation engine (Satori) has no access to your client-side assets or file system by default.

To use local images, you must provide them as either a Base64 Data URL or a Public Absolute URL.

## Vite inline Import

<Callout type="tip" title="Recommended">

Recommended for Self-Contained Images - [example](#svelte-component)

</Callout>

This method uses a Vite feature to embed the image data directly into your JavaScript, converting the asset into a Base64 string at build time. This results in a highly reliable, self-contained OG image.

### 💡 How it Works

The `?inline` query suffix tells Vite to process the asset and export it as a string containing the Base64 data URL (`data:image/png;base64,...`). Since this string is available directly in your server-side code, it requires no file system access or network requests at runtime.

### Example
#### Svelte Component

```svelte showLineNumbers
<script lang="ts">
  // 1. Import the asset using the ?inline suffix
  import myLogoData from '$lib/assets/logo.png?inline';
</script>

<div tw="flex items-center">
  <img 
    src={myLogoData} 
    width="128" 
    height="128" 
    alt="Base64 Logo" 
  />
  <h1>My Base64 Title</h1>
</div>
```

#### Raw HTML/TS

```typescript showLineNumbers
import { ImageResponse } from '@ethercorps/sveltekit-og';
// Import the image directly as data URL
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

## Vite url Import

This method is used when you need the original file content (e.g., for fonts or large images) but want to read the file at runtime without making a network request.

### 💡 How it Works

- The `?url` suffix tells Vite to export the asset's path as a string (e.g., `_app/immutable/assets/logo.png`).
- The `import {read} from "$app/server"` function ([available in SvelteKit](https://svelte.dev/docs/kit/$app-server#read)) is a SvelteKit utility that can access built assets directly from the server's build directory and return an `ArrayBuffer` or `Response`. This is the safest way to read local assets in environments like Cloudflare or Vercel Edge.

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

## Public Absolute Path

This method is the simplest for referencing assets placed in the static folder, but it requires knowing the final public URL of your application, making it less portable across environments.

### 💡 How it Works

- Place the asset in your `static` folder (e.g., `static/logo.png`).
- The asset is served statically at the root (`/logo.png`).
- You must construct the full `http(s)://` URL using the request URL or environment variables to resolve the path. **Satori requires the full absolute URL** to fetch the image via HTTP.

### Example

```typescript showLineNumbers
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

<Callout type="warning" title="Warning for Edge Runtimes"> 
    In Edge Runtimes (Cloudflare, Vercel Edge, Deno), using fetch() to retrieve an asset from your own server (url.origin) can sometimes result in deployment loops or slow cold starts. <br /> Method 1 (?inline) or Method 2 ($app/server/read) is strongly preferred in these environments.
</Callout>