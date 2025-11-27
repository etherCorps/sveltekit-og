---
title: Netlify
description: How to use Sveltekit OG with netlify adapter (@sveltejs/adapter-netlify)
section: Runtime
priority: 4
---

<script>
    import { Callout, Collapsible } from '@svecodocs/kit';
    import NodePackageInstallerTabs from "$lib/components/add-ons/installer-tabs.svelte"; 
    import InstallNetlifyAdapter from "$lib/components/add-ons/packages/sveltekit-adapter/netlify.md"; 
</script>

This section details the configuration needed to use SvelteKit OG with the Netlify Adapter (@sveltejs/adapter-netlify), targeting the Netlify Functions environment (which uses Node.js).

Netlify Functions, similar to Vercel Serverless Functions, are a Node.js-based environment that generally supports the Wasm module dependencies required by the image generation engine. However, the SvelteKit OG plugins ensure the Wasm files are correctly bundled and available within the function context.

## Installation

First, ensure you have the Netlify adapter installed:
<NodePackageInstallerTabs component={InstallNetlifyAdapter}/>

In your `svelte.config.js`, configure the adapter:

```typescript title="svelte.config.js" showLineNumbers
import adapter from 'svelte-adapter-deno';

const config = {
	 ...,
    kit: {
        adapter: adapter()
    },
    ...
};
export default config;
```

## Plugin Configuration

The image generation uses the @resvg/resvg-wasm, satori, yoga, which relies on a Wasm module. The official SvelteKit OG plugins handle the complex Wasm bundling required for the build/runtime. You must choose one of the following plugins based on your sveltekit-og version.

### Vite Plugin (Recommended)

<Callout type="warning" title="Warning">

Vite plugin is available from `sveltekit-og@v4.1.0`. If you are using `v4.0.0` use [Rollup](#rollup-plugin-legacy) plugin.

If you add the plugin while the dev server is running, you might see no generated image. Stop the server and re-start it.

</Callout>

Add the sveltekitOG plugin to your `vite.config.ts`.

```ts title="vite.config.ts" showLineNumbers
import { sveltekit } from '@sveltejs/kit/vite';
import { sveltekitOG } from '@ethercorps/sveltekit-og/plugin';
import { defineConfig } from 'vite';

const config = defineConfig({
	plugins: [
		sveltekit(),
		sveltekitOG() // Add the Vite plugin
	]
});

export default config;
```

### Rollup Plugin (Legacy)

<Callout type="danger" title="Deprecation"> The Rollup plugin will be <strong>deprecated</strong> in <strong>v5</strong>. Migrate to the Vite plugin when possible. </Callout>

Add the `rollupWasm` plugin inside the `rollupOptions` block in your `vite.config.ts`.

```typescript title="vite.config.ts" showLineNumbers
import { sveltekit } from '@sveltejs/kit/vite';
import { rollupWasm } from '@ethercorps/sveltekit-og/plugin';
import { defineConfig } from 'vite';

const config = defineConfig({
	plugins: [sveltekit()],
	build: {
		rollupOptions: {
			// Add rollupWasm plugin for Cloudflare compatibility
			plugins: [rollupWasm()]
		}
	}
});

export default config;
```

## Usage

Once configured, the usage remains the same as any other SvelteKit environment.

- Svelte Components: Refer to the [Svelte Component](/docs/usage/svelte) usage.

- Raw HTML: Refer to the [Raw HTML section](/docs/usage/html) for usage with string templates.

## Preview

<img src="https://netlify.sveltekit-og.dev/cog" class="mt-4 rounded-lg">

Source: https://github.com/etherCorps/sveltekit-og/tree/main/examples/netlify-build <br/>
Live: https://netlify.sveltekit-og.dev/cog

## Known Issues

<Collapsible title="Vite ?url import error">

Netlify throws error when we use [vite url imports](/docs/utilities/local-assets#vite-url-import)

```typescript
import imagePath from '$lib/assets/large_image.jpg?url';
```

</Collapsible>
