---
title: Getting Started
description: A quick guide to get started using Sveltekit OG
section: Overview
---

<script>
	import { Callout } from "@svecodocs/kit";
	import { Steps, Step } from "@svecodocs/kit";
</script>

## Setup
Setting up SvelteKit OG is a two-step process: install the package and plugin.

<Steps>

<Step>Installation</Step>

Install the package using your preferred package manager:
```bash
pnpm add @ethercorps/sveltekit-og
```
```bash
npm install @ethercorps/sveltekit-og
``` 
```bash
yarn add @ethercorps/sveltekit-og
```
```bash
deno add npm:@ethercorps/sveltekit-og
```

<Step>Plugins</Step>

Sveltekit OG provides two plugins (use one of them)
1. [Vite](#vite) - Available from v4.1.x
2. [Rollup](#rollup) - Available for v4.x.x - will be deprecated in v5.

### Vite
Add vite plugin to `vite.config.ts`.

<Callout type="warning" title="Warning">
Vite plugin is available from sveltekit-og@v4.1.0. If you are using v4.0.0 use <a href="#rollup">Rollup</a>

> If you add plugin while dev server is running, you might see no generated image, so stop the server and re-start it.

</Callout>

```js
// vite.config.{ts,js}
import { sveltekit } from '@sveltejs/kit/vite';
import { sveltekitOG } from '@ethercorps/sveltekit-og/plugin';
const config = {
	plugins: [sveltekit(), sveltekitOG()]
};

export default config;
```

### Rollup

Add rollup plugin to `vite.config.ts`.

<Callout type="note" title="Warning">
Rollup plugin is available from sveltekit-og@v4
</Callout>

<Callout type="danger" title="Deprecation">
Rollup plugin will be deprecated in v5
</Callout>

```ts
// vite.config.{ts,js}
import { sveltekit } from '@sveltejs/kit/vite';
import { rollupWasm } from '@ethercorps/sveltekit-og/plugin';
const config = {
	plugins: [sveltekit()],
	build: {
		rollupOptions: {
			plugins: [rollupWasm()],
		}
	}
};

export default config;

```
</Steps>

## Basic Usage

SvelteKit OG works by returning an ImageResponse from a standard SvelteKit server route. 
- Create a new file at src/routes/og/+server.ts.

### Raw HTML string
Creating images with html and css.
```typescript
// src/routes/og/+server.ts
import { ImageResponse } from '@ethercorps/sveltekit-og';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  // 1. Define your HTML template
  // You can use the 'tw' attribute for Tailwind classes
  const html = `
    <div tw="flex w-full h-full bg-white items-center justify-center">
      <div tw="flex flex-col items-center justify-center">
        <h1 tw="text-6xl font-bold text-gray-900">Hello SvelteKit OG!</h1>
        <p tw="text-2xl text-gray-500 mt-4">Dynamic images made easy</p>
      </div>
    </div>
  `;

  // 2. Return the ImageResponse
  return new ImageResponse(html, {
    width: 1200,
    height: 630,
    // The library uses 'Noto Sans' by default if no fonts are provided
  });
};
```
#### Preview

<img class="mt-4" src="/preview" alt="Raw HTML Image">

### Svelte Components

We can create images with svelte components too.

<Callout type="note" title="Svelte options">
  Always add svelte options on top of the component. It will include the generated `styles` from style tag.

```svelte
<svelte:options css="injected" />
```
</Callout>

- Svelte Component

```svelte
<svelte:options css="injected" />
<script lang="ts">
	import Logo from "./logo.png?inline"
	import SvelteLogo from "./svelte-logo.svg?raw"
</script>

<div class="flex flex-col bg-gradient w-full h-full p-5">
	<div class="flex flex-row justify-normal items-center">
		<img src={Logo} class="w-8" />
		<span class="ml-2 font-semibold text-xl text-gray-100">@ethercorps/sveltekit-og</span>
	</div>
	<div class="flex flex-row items-center justify-between w-full h-[90%] px-10">
		<div class="flex flex-col justify-center h-full w-1/2">
			<p class="text-lg -mb-3 text-teal-200 font-bold tracking-wider">SVELTEKIT OG</p>
			<p class="text-5xl font-bold text-teal-400 tracking-widest">VERSION 4 ✨</p>
			<p class="-mt-2 text-lg text-gray-300">Sveltekit OG v4 with support for Node, Deno, Cloudflare Workers, Pages, Vercel and Netlify</p>
		</div>
		<div class="flex flex-row items-center justify-center w-full w-1/2">
			{@html SvelteLogo}
		</div>
	</div>
	<div class="flex flex-row text-gray-400">sveltekit-og.dev</div>
</div>

<style>
	.bg-gradient {
		background: linear-gradient(to right, #2C5364, #203A43, #0F2027); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
	}
</style>
```
- og/+server.ts
```typescript
import type { RequestHandler } from '@sveltejs/kit';
import { ImageResponse } from '@ethercorps/sveltekit-og';
import OG from './OG.svelte';

export const GET: RequestHandler = async () => {
	return new ImageResponse(OG, {
		width: 1200,
		height: 630,
		debug: false
	})
}
```

#### Preview

<img class="mt-4" src="/og.png" alt="Svelte Component Preview">
