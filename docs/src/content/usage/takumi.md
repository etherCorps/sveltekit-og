---
title: Takumi Engine
description: Generate images with the Takumi rendering engine for more formats and a smaller bundle.
section: Usage
priority: 3
---

<script>
	import { Callout } from "@svecodocs/kit";
</script>

## Overview

SvelteKit OG ships two rendering engines. The default `ImageResponse` uses **Satori** (HTML → SVG → PNG). As an alternative, you can render with **[Takumi](https://takumi.kane.tw)** — a Rust engine (native on Node, WebAssembly on the edge) that renders HTML and Svelte components directly to images.

Reach for Takumi when you want:

- **More output formats** — `png`, `jpeg`, `webp`, `ico`, `raw`, and `svg`.
- **A built-in font** — text renders out of the box, no font fetch required.
- **A smaller install** — the Takumi WebAssembly is loaded from `takumi-js`, so nothing extra is bundled into `@ethercorps/sveltekit-og`.

<Callout type="note" title="Available from v4.3.0">

Takumi support is available from `sveltekit-og@v4.3.0`. While v4.3 is in prerelease, install it from the `next` tag: `@ethercorps/sveltekit-og@next`.

</Callout>

## Installation

The Takumi engine lives behind a separate entry point and `takumi-js` is an **optional peer dependency** — install it alongside the package. Apps that only use Satori don't need it.

```bash
pnpm add @ethercorps/sveltekit-og takumi-js
```

<Callout type="warning" title="Plugin still required">

Takumi loads its WebAssembly through the same build plugin as Satori. Make sure the Vite/Rollup plugin is configured as shown in [Getting Started](/docs/getting-started).

</Callout>

## Guide

Import `ImageResponse` from the `/takumi` entry point. The constructor takes the same shape as the Satori one — an HTML string or a Svelte component, then options, then component props.

### Raw HTML

```typescript title="routes/images/takumi.png/+server.ts" showLineNumbers
import { ImageResponse } from '@ethercorps/sveltekit-og/takumi';
import type { RequestHandler } from '@sveltejs/kit';

const template = `
<div style="display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; background: #101011;">
	<h1 style="color: gray; font-size: 80px;">Hello Takumi</h1>
</div>
`;

export const GET: RequestHandler = async () => {
	return new ImageResponse(template, { width: 1200, height: 630 });
};
```

<Callout type="warning" title="Styling">

Takumi reads **inline `style`**, the **`tw`** prop (Tailwind), and `<style>` blocks — it does not process a Tailwind `class` attribute. Use `tw="..."` for Tailwind utilities.

</Callout>

### Svelte Component

Pass the component as the first argument and its props as the third — exactly like the Satori engine. Use `<svelte:options css="injected" />` so component styles are inlined into the SSR output.

```typescript title="routes/images/takumi-component.png/+server.ts" showLineNumbers
import { ImageResponse } from '@ethercorps/sveltekit-og/takumi';
import type { RequestHandler } from '@sveltejs/kit';
import OG from '$lib/components/og/simple.svelte';

export const GET: RequestHandler = async () => {
	return new ImageResponse(OG, { width: 1200, height: 630 }, { title: 'Hello Takumi' });
};
```

## Output Formats

Set `format` to control the encoding. `quality` (0–100) applies to the lossy formats (`jpeg`, `webp`).

```typescript showLineNumbers
// WebP at 80% quality
new ImageResponse(template, { format: 'webp', quality: 80 });

// JPEG
new ImageResponse(template, { format: 'jpeg', quality: 90 });

// Vector SVG
new ImageResponse(template, { format: 'svg' });
```

| Format | Content-Type |
| ------ | ------------ |
| `png` (default) | `image/png` |
| `jpeg` | `image/jpeg` |
| `webp` | `image/webp` |
| `ico` | `image/x-icon` |
| `svg` | `image/svg+xml` |
| `raw` | `application/octet-stream` |

## Fonts

Takumi ships a built-in sans-serif, so the examples above work with **no fonts configured**. To use your own, pass font instances to the `fonts` option.

<Callout type="tip" title="No resolveFonts needed">

Unlike the Satori path, the Takumi engine resolves and caches fonts internally. Pass your `GoogleFont` / `CustomFont` **instances** directly — you do **not** call `resolveFonts` first.

</Callout>

```typescript showLineNumbers title="+server.ts"
import { ImageResponse, GoogleFont, CustomFont } from '@ethercorps/sveltekit-og/takumi';
import { read } from '$app/server';
import RegularFont from '$lib/assets/MyFont-Regular.ttf?url';

export const GET = async () => {
	return new ImageResponse(
		`<div style="display:flex; font-family: 'Inter'">Hello World</div>`,
		{
			width: 1200,
			height: 630,
			fonts: [
				new GoogleFont('Inter', { weight: 400 }),
				new CustomFont('My Font', () => read(RegularFont).arrayBuffer(), { weight: 700 })
			]
		}
	);
};
```

You can also pass a raw Takumi font descriptor — an object with `name`, `data` (bytes or a loader), and optional `weight` / `style`:

```typescript showLineNumbers
new ImageResponse(template, {
	fonts: [
		{
			name: 'Inter',
			data: () => fetch('https://example.com/inter.woff2').then((r) => r.arrayBuffer()),
			weight: 400
		}
	]
});
```

## Emoji

Emoji are rendered from a provider, controlled with the `emoji` option (defaults to `twemoji`). Set it to `"from-font"` to source emoji glyphs from your loaded fonts instead.

```typescript showLineNumbers
new ImageResponse(`<div style="display:flex">Ship it 🚀</div>`, { emoji: 'noto' });
```

## Next Steps

- **Satori vs Takumi**: The default [Svelte](/docs/usage/svelte) and [Raw HTML](/docs/usage/html) guides cover the Satori engine. The API is the same — only the import and supported formats differ.
- **Fonts**: The [Fonts](/docs/utilities/fonts) guide explains `GoogleFont` and `CustomFont` in detail.
- **Local Assets**: To include local images in your images, see [Local Assets](/docs/advanced-usage/local-assets).
