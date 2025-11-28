---
title: Fonts
description: How to use self hosted, custom and google fonts with sveltekit-og.
section: Utilities
priority: 1
---

<script>
	import { Callout } from "@svecodocs/kit";
</script>

<Callout type="note" title="Feature available from v4.2.0">

The `GoogleFont`, `CustomFont`, and `resolveFonts` utilities were introduced in <br /> `sveltekit-og@v4.2.0`.

</Callout>

To ensure consistent and high-quality typography in your generated images, you must provide the font files to the rendering engine (Satori) as raw binary data. You cannot rely on standard CSS `@font-face` rules.

The SvelteKit OG provides `CustomFont`, and `GoogleFont` classes, along with the `resolveFonts` utility, to handle loading, caching, and preparing the font data.

<Callout type="tip" title="Always use resolveFonts">

The `ImageResponse` options expects an array of resolved font data. You must always pass your font instances to `await resolveFonts([...])` before passing the result to the `fonts` option.

</Callout>


## 🌐 Using Google Fonts

The `GoogleFont` class is the easiest way to get started. It abstracts away the network logic, fetches the correct CSS, parses the font URL, and applies an internal cache to prevent redundant requests.

```typescript showLineNumbers title="+server.ts"
import { ImageResponse } from '@ethercorps/sveltekit-og';
import { GoogleFont, resolveFonts } from '@ethercorps/sveltekit-og/fonts';

// 1. Define the GoogleFont instances
const interRegular = new GoogleFont('Inter', {
	weight: 400,
	name: 'Inter',
});

const interBold = new GoogleFont('Inter', {
	weight: 700
});

export const GET = async () => {
	// 2. Await the resolution (which triggers the fetch/cache lookup)
	const resolvedFontOptions = await resolveFonts([interRegular, interBold]);

	return new ImageResponse(
		`<div tw="flex" style="font-family: 'Inter'">Hello World</div>`,
		{
			fonts: resolvedFontOptions
		}
	);
};
```

## 📂 Using Local Custom Fonts

This method involves placing TrueType (`.ttf`) or OpenType (`.otf`) files in the project and reading them directly from the file system.

### Steps
1.  **Import**: Use the Vite `?url` suffix to get the build-time path of your local font file.
2.  **Load**: Use SvelteKit's `$app/server` `read` function to retrieve the file.
3.  **Wrap**: Pass a **function** that returns the `ArrayBuffer` to `CustomFont`.

<Callout type="warning" title="Netlify Adapter">

Vite's `?url` import combined with `read` may encounter issues on specific adapters like Netlify. In those cases, you may need to use Node's `fs` module or fetch the font from a public URL.

</Callout>

```typescript showLineNumbers title="+server.ts"
import { ImageResponse } from '@ethercorps/sveltekit-og';
import { CustomFont, resolveFonts } from '@ethercorps/sveltekit-og/fonts';
import { read } from '$app/server'; // SvelteKit Runtime Dependency
import RegularFontPath from '$lib/assets/MyFont-Regular.ttf?url';
import BoldFontPath from '$lib/assets/MyFont-Bold.ttf?url';

// 1. Define the CustomFont instances
const myCustomRegular = new CustomFont(
	'My Custom Font',
	// The input function executes `read().arrayBuffer()` only when needed (lazy-loaded)
	() => read(RegularFontPath).arrayBuffer(),
	{ weight: 400 }
);

const myCustomBold = new CustomFont(
	'My Custom Font',
	() => read(BoldFontPath).arrayBuffer(),
	{ weight: 700 }
);

export const GET = async () => {
	// 2. Resolve the promises to get the final ArrayBuffer array
	const resolvedFontOptions = await resolveFonts([myCustomRegular, myCustomBold]);

	return new ImageResponse(
		`<div tw="flex" style="font-family: 'My Custom Font'">Hello World</div>`,
		{
			width: 1200,
			height: 630,
			fonts: resolvedFontOptions
		}
	);
};
```

## ☁️ Using Remote Fonts

If font file is hosted on an external CDN (e.g., AWS S3, generic file host), fetch it directly using the global `fetch` API.

```typescript showLineNumbers title="+server.ts"
import { ImageResponse } from '@ethercorps/sveltekit-og';
import { CustomFont, resolveFonts } from '@ethercorps/sveltekit-og/fonts';

const REMOTE_FONT_URL = 'https://my-cdn.com/assets/FontAwesome-Regular.otf';

// 1. Define the CustomFont instance
const fontAwesome = new CustomFont(
	'Font Awesome',
	// Pass a function that returns the ArrayBuffer promise via fetch
	() => fetch(REMOTE_FONT_URL).then((res) => res.arrayBuffer()),
	{ weight: 400 }
);

export const GET = async () => {
	const resolvedFontOptions = await resolveFonts([fontAwesome]);

	return new ImageResponse(
		`<div tw="flex" style="font-family: 'Font Awesome'">Icon</div>`,
		{
			fonts: resolvedFontOptions
		}
	);
};
```

## 🔢 Multiple Font Sources

Mix and match multiple font sources `local fonts`, `Google Fonts`, and `remote fonts` URLs in a single request.

```typescript
import { ImageResponse } from '@ethercorps/sveltekit-og';
import { CustomFont, GoogleFont, resolveFonts } from '@ethercorps/sveltekit-og/fonts';
import { read } from '$app/server';

// --- Local Font Paths ---
import LocalRegularPath from '$lib/assets/LocalFont-R.ttf?url';

// --- Custom Remote URL ---
const ICON_FONT_URL = 'https://cdn.example.com/icons.ttf';

export const GET = async () => {
	// 1. Define all font instances
	const fontsToLoad = [
		// A. 📦 LOCAL CUSTOM FONT
		new CustomFont('Local App Font', () => read(LocalRegularPath).arrayBuffer(), { weight: 400 }),

		// B. 🌐 GOOGLE FONT
		new GoogleFont('Roboto Mono', { weight: 500 }),

		// C. ☁️ REMOTE FONT
		new CustomFont('Custom Icons', () => fetch(ICON_FONT_URL).then((res) => res.arrayBuffer()), {
			weight: 400
		})
	];

	// 2. Resolve all concurrently
	const resolvedFontOptions = await resolveFonts(fontsToLoad);

	// 3. Render
	return new ImageResponse(
		`<div tw="flex flex-col p-10 bg-gray-50">
            <h1 style="font-family: 'Local App Font'">Title</h1>
            <p style="font-family: 'Roboto Mono'">Code</p>
            <span style="font-family: 'Custom Icons'">Icon</span>
        </div>`,
		{
			width: 1200,
			height: 630,
			fonts: resolvedFontOptions
		}
	);
};
```
