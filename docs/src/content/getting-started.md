---
title: Getting Started
description: A quick guide to get started using Sveltekit OG
section: Overview
---

<script>
	import { Callout } from "@svecodocs/kit";
	import { Steps, Step } from "@svecodocs/kit";
    import NodePackageInstallerTabs from "$lib/components/add-ons/installer-tabs.svelte";
    import InstallSveltekitOg from "$lib/components/add-ons/packages/sveltekit-og.md";
</script>

## Setup: Installation & Plugin

Setting up SvelteKit OG is a two-step process: installing the core package and adding the necessary plugin to handle `wasm` file for build.

<Callout type="warning" title="Required Svelte Version">

We strongly suggest using **sveltekit-og v4** as older versions are not maintained. **Sveltekit OG v4 only supports Svelte v5 (Runes)** and later. We are not planning to support Svelte v4.

</Callout>

<Steps>

<Step>Installation</Step>

Install the package using your preferred package manager:

<NodePackageInstallerTabs component={InstallSveltekitOg} />

<Step>Plugins Configuration</Step>

Sveltekit OG requires a plugin to handle native dependencies (WASM). You must use one of the two options below.

### Vite Plugin

This is the preferred method for SvelteKit v4.1.0 onwards. It uses the simpler `sveltekitOG` function.

<Callout type="warning" title="Warning">

The Vite plugin is available from `sveltekit-og@v4.1.0`. If you are using `v4.0.0`, you must use the [Rollup plugin](#rollup-plugin) configuration below. If you add the plugin while the dev server is running, please **stop and restart the server** to ensure the plugin is applied correctly.

</Callout>

```js title="vite.config.js" showLineNumbers
import { sveltekit } from '@sveltejs/kit/vite';
import { sveltekitOG } from '@ethercorps/sveltekit-og/plugin';
const config = {
	plugins: [sveltekit(), sveltekitOG()]
};

export default config;
```

### Rollup Plugin

This plugin is primarily exist because of my own mistake.

<Callout type="danger" title="Deprecation Notice">
The Rollup plugin will be deprecated in v5 of SvelteKit OG. Please migrate to the Vite plugin if possible. 
</Callout>

```ts title="vite.config.js" showLineNumbers
import { sveltekit } from '@sveltejs/kit/vite';
import { rollupWasm } from '@ethercorps/sveltekit-og/plugin';
const config = {
	plugins: [sveltekit()],
	build: {
		rollupOptions: {
			plugins: [rollupWasm()]
		}
	}
};

export default config;
```

</Steps>


## Next Steps

Once the package is installed and the plugin is configured, you are ready to create your first dynamic image by defining a SvelteKit server route and returning an ImageResponse.
- **For Svelte Components**: If you prefer building your images using `.svelte` files, see the [Basic Image Generation](/docs/usage/svelte) guide.
- **For Raw HTML**: If you prefer using pure HTML strings with Tailwind CSS, see the [Raw HTML](/docs/usage/html) guide.