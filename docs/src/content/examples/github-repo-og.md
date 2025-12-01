---
title: GitHub Repository OG Image
description: Recreate the iconic GitHub repository social card using dynamic data and Svelte components.
section: Examples
---

<script>
	import { Callout, DemoContainer, Tabs, TabItem } from "@svecodocs/kit";
    import SvelteComponentPlayground from "$lib/components/playground/svelte-component.svelte";
    import { page } from "$app/state";

	const serverFiles = ["github-repo.svelte", "+server.ts", "api.ts", "fonts-utils.ts"];
    const tabHashMapping = {
      "#the-visual-component": "github-repo.svelte",
      "#the-api-route": "+server.ts",
      "#data-fetching-helper": "api.ts",
      "#fonts-config": "fonts-utils.ts"
    };
    const currentTab = $derived(page.url.hash ? tabHashMapping[page.url.hash] : '#the-visual-component');
</script>

## Overview

In this example, we will recreate the iconic GitHub repository Open Graph image. This involves:
1.  **Fetching live data** from the GitHub API.
2.  **Loading custom fonts** (Inter) to match the brand.
3.  **Rendering a Svelte component** that visually mimics the design.

**Target Design:**
<a target="_blank" rel="external" no-referrer="no-referrer" href="https://opengraph.githubassets.com/b127930b7d5e9d97f1321c31d6f1e42ad9a17cf649423ad26c9bfb2dee71fe5d/etherCorps/sveltekit-og">
<img src="https://opengraph.githubassets.com/b127930b7d5e9d97f1321c31d6f1e42ad9a17cf649423ad26c9bfb2dee71fe5d/etherCorps/sveltekit-og" class="mt-4 rounded-lg shadow-md border border-gray-200" alt="GitHub OG target image">
</a>

---

## Code Implementation

<Tabs value={currentTab} items={serverFiles}>

<TabItem id="#the-visual-component" value="github-repo.svelte">

### The Visual Component

Svelte component handles the layout. It receives data via props and uses Tailwind classes (via `class` attribute) for styling.

```svelte showLineNumbers title="github-repo.svelte" file=../../lib/components/og/github-repo.svelte


```

</TabItem>

<TabItem value="+server.ts">

### The API Route

Server endpoint ties everything together. It handles the request, fetches the data, loads the fonts, and returns the generated image.

```ts showLineNumbers file=../../routes/(examples)/images/github/+server.ts title="github-repo/+server.ts"

```

</TabItem>

<TabItem value="api.ts">

### Data Fetching Helper

A simple utility to fetch repository details (stars, forks, issues) from the GitHub API.

```ts showLineNumbers file=../../routes/(examples)/images/github/api.ts title="github/api.ts"

```

</TabItem>

<TabItem value="fonts-utils.ts">

### Fonts Config

To get the authentic look, we load the `Inter` font family (`Regular` and `Bold`) using Google Fonts.

```ts showLineNumbers file=../../lib/fonts-utils.ts title="lib/fonts-utils.ts"

```

</TabItem>
</Tabs>


## Live Preview

Start your development server and visit the URL below. Change the `owner` and `repo` query parameters to generate cards for different repositories instantly in [playground](#playground).


<a target="_blank" rel="external" no-referrer="no-referrer" href="https://sveltekit-og.dev/images/github?owner=etherCorps&repo=sveltekit-og">
    <img src="/images/github?owner=etherCorps&repo=sveltekit-og" class="mt-4 rounded-lg" alt="Github Repos OG Image">
</a>

## Playground

Experiment with the component props directly in the browser:

<DemoContainer class="flex flex-wrap gap-4">
	<SvelteComponentPlayground />
</DemoContainer>
