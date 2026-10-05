---
title: Client-side Rendering
description: Generate OG images in the browser or a web worker, with no server request.
section: Usage
priority: 4
---

<script>
	import { Callout } from "@svecodocs/kit";
</script>

## Overview

The `@ethercorps/sveltekit-og/client` entry renders images **in the browser** — on the main thread or inside a web worker — using the same two engines as the server: **Takumi** (default) or **Satori + ReSVG**. Nothing is sent to your server.

Use it for live previews in an editor or CMS, or for sites with no server (`adapter-static`) that still want images generated at runtime.

<Callout type="note" title="Available from v4.4.0">

Client-side rendering is available from `sveltekit-og@4.4.0`. Try it early from the `next` tag: `npm i @ethercorps/sveltekit-og@next`.

</Callout>

## Requirements

- **Vite** (every SvelteKit app). The entry loads its WebAssembly and fonts through Vite `?url` asset imports; other bundlers are not supported.
- For Takumi, `takumi-js` must be installed (it is an optional peer dependency).
- Pages that render client-side must run in the browser: set `export const ssr = false;` in the route's `+page.ts`, or only call the API inside `onMount`/event handlers.

## Usage

```ts title="src/routes/preview/+page.svelte (script)" showLineNumbers
import { createImage } from "@ethercorps/sveltekit-og/client";

const html = `<div style="display:flex;width:100%;height:100%;align-items:center;justify-content:center;font-size:64px">Hello</div>`;

// Takumi is the default engine
const res = createImage(html, { width: 1200, height: 630, format: "png" });
const url = URL.createObjectURL(await res.blob());
```

`createImage` (and the `ImageResponse` class, which is the same thing as a `Response` subclass) returns a standard `Response`; read it with `.blob()`, `.arrayBuffer()` or `.text()`.

### Choosing an engine

```ts
// Satori + ReSVG: png or svg
createImage(html, { engine: "satori", format: "svg", width: 1200, height: 630 });

// Takumi: png, jpeg, webp, ico, raw, svg
createImage(html, { engine: "takumi", format: "webp", quality: 80, width: 1200, height: 630 });
```

The options are a discriminated union on `engine`, so TypeScript narrows the remaining fields (formats, fonts, emoji) to the engine you picked. Satori raster formats other than `png` are rendered as `png`.

**Only the engine you use is downloaded.** Each engine is a separate chunk; Takumi users never fetch Satori's WebAssembly and vice versa. Rough first-render downloads: Takumi ≈ 3.7 MB wasm; Satori ≈ 2.6 MB wasm (yoga + resvg) plus ≈ 1.2 MB of default fonts unless you pass your own.

### Svelte components

```ts
import Card from "./Card.svelte";

createImage(Card, { width: 1200, height: 630 }, { title: "Hello", subtitle: "from the browser" });
```

Components are mounted in a detached shadow root and their HTML is captured, so page CSS can't leak into the image. **Only inline styles are captured** — scoped `<style>` blocks and `css="injected"` are not. Use inline styles, or the `stylesheets` / Tailwind options.

## Web workers

Rendering works inside a module worker: `new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })`.

Workers have no DOM, so **only HTML strings can be rendered there**. Passing a Svelte component rejects with an error whose `code` is `COMPONENT_IN_WORKER`:

```ts
try {
	await createImage(Card, { width: 1200, height: 630 }, props).arrayBuffer();
} catch (err) {
	if ((err as { code?: string }).code === "COMPONENT_IN_WORKER") {
		// render the component to HTML on the main thread first, then post the string
	}
}
```

## Errors

Render failures reject from `.blob()` / `.arrayBuffer()` / `.text()` with an `ImageResponseError` carrying a `code` (`COMPONENT_IN_WORKER`, `FONT_LOAD_FAILED`, `SATORI_RENDER_FAILED`, `TAKUMI_RENDER_FAILED`, …). Read the response through one of those three methods — reading `res.body` with your own reader also works, but any other `Response` helper would surface a browser-generic `TypeError: Failed to fetch` instead.

## Fonts

- **Takumi** has a built-in sans-serif: text renders with no setup.
- **Satori** needs font data. If you pass no `fonts`, the package uses a bundled **Noto Sans** (regular + bold) served from your own site — no cross-origin requests, works offline. Pass `fonts` to use your own; the helpers from the main entry are re-exported here:

```ts
import { createImage, GoogleFont, CustomFont } from "@ethercorps/sveltekit-og/client";

createImage(html, {
	engine: "satori",
	width: 1200,
	height: 630,
	fonts: [new GoogleFont("Inter", { weight: 700 })],
});
```

## Limitations

- Vite-only (`?url` asset imports).
- Components: inline styles only; HTML strings only inside workers.
- The Satori path parses HTML with `satori-html` in your bundle. Vite's default minifier is fine; if you minify with terser `ascii_only`, selectors like `:not()` break in the parser — a known upstream `ultrahtml` issue.
- Takumi options beyond `width`, `height`, `format`, `quality`, `stylesheets`, `emoji` and `fonts` are not passed through yet.
