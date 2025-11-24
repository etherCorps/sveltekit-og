---
title: Cloudflare
description: How to use Sveltekit OG with cloudflare adapter (@sveltejs/cloudflare-adapter)
section: Runtime
---

<script>
    import { Callout} from '@svecodocs/kit';
    import NodePackageInstallerTabs from "$lib/components/add-ons/installer-tabs.svelte"; 
    import InstallCloudflareAdapter from "$lib/components/add-ons/packages/sveltekit-adapter/cloudflare.md"; 
</script>

This section details the necessary configuration to ensure the SvelteKit OG's image generation engine, which relies on **WebAssembly (Wasm)**, is correctly bundled and executed within the **Cloudflare Workers** or **Pages** runtime environment.

## Installation

To deploy with Cloudflare, you must first install the necessary SvelteKit adapter:

<NodePackageInstallerTabs component={InstallCloudflareAdapter} />

In your `svelte.config.js`, configure the adapter:

```typescript title="svelte.config.js" showLineNumbers
import adapter from '@sveltejs/adapter-cloudflare';

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

### Cloudflare Workers

<img src="https://workers.sveltekit-og.dev/cog" class="mt-4 rounded-lg">

Source: https://github.com/etherCorps/sveltekit-og/tree/main/examples/cf-workers-build <br/>
Live: https://workers.sveltekit-og.dev/cog

### Cloudflare Pages

<img src="https://pages.sveltekit-og.dev/cog" class="mt-4 rounded-lg">

Source: https://github.com/etherCorps/sveltekit-og/tree/main/examples/cf-pages-build <br/>
Live: https://pages.sveltekit-og.dev/cog
