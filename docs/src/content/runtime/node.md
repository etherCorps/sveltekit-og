---
title: Node JS
description: How to use Sveltekit OG with the node adapter (@sveltejs/adapter-node)
section: Runtime
priority: 3
---

<script>
    import { Callout} from '@svecodocs/kit';
    import NodePackageInstallerTabs from "$lib/components/add-ons/installer-tabs.svelte"; 
    import InstallNodeAdapter from "$lib/components/add-ons/packages/sveltekit-adapter/node.md"; 
</script>

This section details the necessary configuration to use SvelteKit OG with the Node Adapter (@sveltejs/adapter-node), targeting a standard self-hosted Node.js server environment.

## Installation

First, ensure you have the Node adapter installed:
<NodePackageInstallerTabs component={InstallNodeAdapter}/>

In your `svelte.config.js`, configure the adapter:

```typescript title="svelte.config.js" showLineNumbers
import adapter from '@sveltejs/adapter-node';

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

You must use one of the SvelteKit OG plugins and explicitly set the esmImport option to false. This configuration ensures the Wasm module is loaded using Node's standard functions, providing reliable execution in the Node environment.

### Vite Plugin (Recommended)

<Callout type="warning" title="Warning">

Vite plugin is available from `sveltekit-og@v4.1.0`. If you are using `v4.0.0` use [Rollup](#rollup-plugin-legacy) plugin.

If you add the plugin while the dev server is running, you might see no generated image. Stop the server and re-start it.

</Callout>

Add the `sveltekitOG` plugin to your `vite.config.ts`, passing `{ esmImport: false }` to the options.

```typescript title="vite.config.ts" showLineNumbers
import { sveltekit } from '@sveltejs/kit/vite';
import { sveltekitOG } from '@ethercorps/sveltekit-og/plugin';
import { defineConfig } from 'vite';

const config = defineConfig({
	plugins: [
		sveltekit(),
		sveltekitOG({
			esmImport: false // Crucial for reliable Wasm loading in Node.js
		})
	]
});

export default config;
```

### Rollup Plugin (Legacy)

<Callout type="danger" title="Deprecation"> 
The Rollup plugin will be <strong>deprecated</strong> in <strong>v5</strong>. Migrate to the Vite plugin when possible. 
</Callout>

If using the Rollup plugin, apply `{ esmImport: false }` directly to the `rollupWasm` plugin configuration within `rollupOptions`.

```typescript title="vite.config.ts" showLineNumbers
import { sveltekit } from '@sveltejs/kit/vite';
import { rollupWasm } from '@ethercorps/sveltekit-og/plugin';
import { defineConfig } from 'vite';

const config = defineConfig({
	plugins: [sveltekit()],
	build: {
		rollupOptions: {
			plugins: [
				rollupWasm({
					esmImport: false // Crucial for reliable Wasm loading in Node.js
				})
			]
		}
	}
});

export default config;
```

## Usage

Once configured, the usage remains the same as any other SvelteKit environment.

- Svelte Components: Refer to the [Svelte Component](/docs/usage/svelte) usage.

- Raw HTML: Refer to the [Raw HTML section](/docs/usage/html) for usage with string templates.

## Preview (Self Test)

Source: https://github.com/etherCorps/sveltekit-og/tree/main/examples/node-build

To verify the Node setup works correctly, you can clone and run the dedicated example repository.

### Step-by-Step Guide

- Clone the Repository and Navigate:

```shell title="Bash"
git clone https://github.com/etherCorps/sveltekit-og.git
cd sveltekit-og/examples/node-build
```

- Install Dependencies:

```shell title="Bash"
pnpm install
```

- **Build the Project**: This command runs the build process, applying the @sveltejs/adapter-node and the Wasm plugins, resulting in a deployable Node server build in the ./build directory.

```shell title="Bash"
pnpm run build
```

- **Start the preview Server**: This command starts the Node server using the generated output.

```shell
pnpm run preview
```

More on how to use [adapter-node in sveltekit](https://svelte.dev/docs/kit/adapter-node)
