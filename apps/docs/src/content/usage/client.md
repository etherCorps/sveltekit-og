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
- `takumi-js` must be installed to use the client entry with **either** engine: the bundler resolves the Takumi chunk at build time even if you only ever pick Satori.
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

The client entry code-splits (one chunk per engine), and Vite's default worker format (`iife`) can't code-split, so set the ES format in `vite.config`:

```js title="vite.config.js"
export default defineConfig({
	plugins: [sveltekit()],
	worker: { format: "es" },
});
```

Without it, `vite dev` works but `vite build` fails with `Invalid value "iife" for option "output.format"`.

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

Render failures reject from `.blob()` / `.arrayBuffer()` / `.text()` with an `ImageResponseError` carrying a `code` (`COMPONENT_IN_WORKER`, `FONT_LOAD_FAILED`, `SATORI_RENDER_FAILED`, `TAKUMI_RENDER_FAILED`, …). Read the response through one of those three methods. Reading `res.body` with your own reader gives you a wrapper error whose `originalError` holds the coded one; any other `Response` helper (`clone()`, `bytes()`) surfaces a browser-generic `TypeError: Failed to fetch` instead.

## Fonts

- **Takumi** has a built-in sans-serif: text renders with no setup.
- **Satori** needs font data. If you pass no `fonts`, the package uses a bundled **Noto Sans** (regular + bold) served from your own site — no cross-origin requests, works offline.

To use your own fonts, supply the bytes with `CustomFont` (put the file in `static/` or import it with `?url`). Satori wants resolved data, so pass it through `resolveFonts`; Takumi accepts `CustomFont` instances directly:

```ts
import { createImage, CustomFont, resolveFonts } from "@ethercorps/sveltekit-og/client";

const inter = new CustomFont("Inter", () => fetch("/fonts/Inter-Bold.ttf").then((r) => r.arrayBuffer()), { weight: 700 });

// Satori
createImage(html, { engine: "satori", width: 1200, height: 630, fonts: await resolveFonts([inter]) });

// Takumi
createImage(html, { engine: "takumi", width: 1200, height: 630, fonts: [inter] });
```

`GoogleFont` is **not** available on the client entry: browsers can't change their User-Agent, so Google Fonts serves `woff2`, which neither engine's loader accepts. Download the TTF and use `CustomFont`.

## Limitations

- Vite-only (`?url` asset imports).
- Components: inline styles only; HTML strings only inside workers.
- The Satori path parses HTML with `satori-html` in your bundle. Vite's default minifier is fine; if you minify with terser `ascii_only`, selectors like `:not()` break in the parser — a known upstream `ultrahtml` issue.
- Takumi options beyond `width`, `height`, `format`, `quality`, `stylesheets`, `emoji` and `fonts` are not passed through yet.
