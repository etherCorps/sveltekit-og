---
title: Svelte Component
description: The simplest guide to generating your first static OG image using svelte component.
section: Usage
priority: 1
---

<script>
	import { Callout, DemoContainer } from '@svecodocs/kit';
    import SvelteComponentPlayground from '$lib/components/playground/svelte-component.svelte';
</script>

## Prerequisites

Ensure, **Vite/Rollup Plugin** configuration as described in the [Getting Started](/docs/getting-started).

## Guide

We will create the simplest possible Open Graph image. This example uses a **Svelte component** without any dynamic data fetching or complex logic.

### Create your Component

Component should use standard HTML and CSS (or utility classes from Tailwind CSS). Ensure the component's root element has a style of **`width: 100%`** and **`height: 100%`** to correctly fill the rendering area defined in the options.

<Callout type="warning" title="Important">

If using `style` blocks, you must enable CSS injection in svelte options.

```svelte
<svelte:options css="injected" />
```
</Callout>

```svelte title="lib/components/og/simple.svelte" showLineNumbers file=../../lib/components/og/simple.svelte
 // Auto added from source file
```

### Create API route

Create a SvelteKit server route (a `+server.ts` file) and use the `ImageResponse` constructor to render your component. For this basic setup, we include only the mandatory configuration: the component, dimensions, and necessary fonts.

```typescript title="routes/images/simple.png/+server.ts" showLineNumbers file=../../routes/(examples)/images/simple.png/+server.ts
 // Auto added from source file
```

### Preview

Visit the URL corresponding to route in browser (e.g. `http://localhost:5173/images/simple.png`).

<a target="_blank" rel="external" no-referrer="no-referrer" href="https://sveltekit-og.dev/images/simple.png">
    <img src="/images/simple.png" class="mt-4 rounded-lg" alt="Simple OG Image">
</a>

## Using Vanilla CSS

The examples above use `Style` attribute. However, you can also use standard CSS within Svelte Component `<style>` block or use Tailwind CSS.

<Callout type="warning" title="Important">

If using `style` blocks, you must enable CSS injection in svelte options.

```svelte
<svelte:options css="injected" />
```
</Callout>

```svelte title="vanills-css.svelte" showLineNumbers
<svelte:options css="injected" />

<script>
	// component props
</script>

<div class="card">
	<h1>Hello World</h1>
</div>

<style>
	.card {
		display: flex;
		background-color: white;
		height: 100%;
		align-items: center;
		justify-content: center;
	}
	h1 {
		font-size: 60px;
		color: black;
	}
</style>
```

## ➡️ Next Steps

- **Types Reference**: For a full overview of all options and parameters for `ImageResponse`, see [Types](/docs/utilities/types) reference guide.
- **Local Assets**: To include local images or other assets in OG images, see [Local Assets](/docs/utilities/local-assets) guide.
- **Custom Fonts**: To use fonts other than the default, see [Fonts](/docs/utilities/fonts) guide for detailed instructions.
