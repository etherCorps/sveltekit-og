---
title: Deno Deploy
description: How to use Sveltekit OG with the Deno adapter (svelte-adapter-deno)
section: Runtime
priority: 5
---

<script>
    import { Callout, Collapsible } from '@svecodocs/kit';
    import NodePackageInstallerTabs from "$lib/components/add-ons/installer-tabs.svelte"; 
    import InstallDenoAdapter from "$lib/components/add-ons/packages/sveltekit-adapter/deno.md"; 
</script>

This section details the configuration needed to deploy SvelteKit OG using the Deno adapter (svelte-adapter-deno), targeting the Deno Runtime (Deno Deploy).

## Installation

To deploy with deno, you must first install the necessary SvelteKit adapter:

<NodePackageInstallerTabs component={InstallDenoAdapter} selected="deno"/>

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

<img src="https://vercel.sveltekit-og.dev/sc" class="mt-4 rounded-lg">

Source: https://github.com/etherCorps/sveltekit-og/tree/main/examples/deno-build <br/>
Live: https://deno.sveltekit-og.dev/cog

## Known Issues

<Collapsible title="Vite asset import error">

Deno throws error when we use [vite url imports](/docs/utilities/local-assets)

```typescript
import imagePath from '$lib/assets/JetBrainsMono-Regular.ttf?url';

or

import imagePath from '$lib/assets/JetBrainsMono-Regular.ttf';
```

Error:

```shell
NotFound: No such file or directory (os error 2): open '_app/immutable/assets/JetBrainsMono-Regular.Dh36KTnx.ttf'
    at Object.openSync (ext:deno_fs/30_fs.js:543:15)
    at read (file:///app/src/.deno-deploy/handler.ts:55:25)
    at wrapped_read (file:///app/src/.deno-deploy/server/index.js:4390:24)
    at read (file:///app/src/.deno-deploy/server/entries/endpoints/_server.ts.js:142:25)
    at CustomFont.weight [as input] (file:///app/src/.deno-deploy/server/entries/endpoints/_server.ts.js:154:42)
    at fallback (file:///app/src/.deno-deploy/server/entries/endpoints/_server.ts.js:40:74)
    at eventLoopTick (ext:core/01_core.js:179:7)
    at async file:///app/src/.deno-deploy/server/entries/endpoints/_server.ts.js:97:24
    at async Promise.all (index 0)
    at async resolveFonts (file:///app/src/.deno-deploy/server/entries/endpoints/_server.ts.js:96:25)
```

</Collapsible>
