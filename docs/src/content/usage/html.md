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

## Prerequisites

Ensure, **Vite/Rollup Plugin** configuration as described in the [Getting Started](/docs/getting-started).

## Guide

This guide shows the most basic functionality: rendering a static image directly from an HTML string, without Svelte components.

### HTML Template

Define the HTML string directly in `+server.ts` file. Remember to use **inline styles** or utility classes, as the image renderer does not process external CSS files.

```typescript title="src/routes/images/raw-html/+server.ts" showLineNumbers
const htmlString = `
<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; height: 100%; background-color: #101011;">
	<h1 style="color: gray; font-size: 80px; margin: 0;">@ethercorps/sveltekit-og</h1>
	<p style="color: gray; font-size: 36px; margin-top: 20px;">Your Raw HTML Open Graph Image!</p>
</div>
`;
```

### API Route

The key difference here is that you pass the string as the first argument to ImageResponse. The third argument (for Svelte component props) is not used.

```typescript title="routes/images/raw-html.png/+server.ts" showLineNumbers file=../../routes/(examples)/images/raw-html.png/+server.ts
// Auto added by remark-code-import
```

### Preview

Visit the URL corresponding to route in browser (e.g. `http://localhost:5173/images/raw-html.png`).

<a target="_blank" rel="external" no-referrer="no-referrer" href="https://sveltekit-og.dev/images/raw-html.png">
    <img src="/images/raw-html.png" class="mt-4 rounded-lg" alt="Raw HTML OG Image">
</a>


## Next Steps

- **Dynamic Data**: To inject dynamic data (e.g., a post title) into your HTML string, you will need to use `JavaScript` string replacement or a dedicated **templating engine** before passing the string to `ImageResponse`.
- **Types Reference**: For a full overview of all options and parameters for `ImageResponse`, see [Types](/docs/utilities/types) reference guide.
- **Local Assets**: To include local images or other assets in OG images, see [Local Assets](/docs/utilities/local-assets) guide.
- **Custom Fonts**: To use fonts other than the default, see [Fonts](/docs/utilities/fonts) guide for detailed instructions.
