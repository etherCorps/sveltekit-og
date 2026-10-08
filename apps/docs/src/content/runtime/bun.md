---
title: Bun
description: How to use SvelteKit OG with the official Bun adapter (@sveltejs/adapter-bun)
section: Runtime
priority: 6
---

<script>
    import { Callout } from '@svecodocs/kit';
    import NodePackageInstallerTabs from "$lib/components/add-ons/installer-tabs.svelte";
    import InstallBunAdapter from "$lib/components/add-ons/packages/sveltekit-adapter/bun.md";
</script>

This section details the configuration needed to run SvelteKit OG on the [Bun](https://bun.sh) runtime with the official Bun adapter (`@sveltejs/adapter-bun`). Both engines work: Satori + ReSVG take the Node code path (the wasm is read from `node_modules`), and Takumi resolves its native backend through its `bun` export condition.

<Callout type="note" title="Requirements">

`@sveltejs/adapter-bun` needs **SvelteKit 3** and **Bun 1.4 or newer**. The adapter also requires the build itself to run under Bun — `vite build` started by Node fails with "adapter-bun requires running the SvelteKit build with Bun".

</Callout>

## Installation

Install the Bun adapter:

<NodePackageInstallerTabs component={InstallBunAdapter} selected="bun"/>

SvelteKit 3 has no `svelte.config.js`; pass the adapter to `sveltekit()` in `vite.config.js`:

```javascript title="vite.config.js" showLineNumbers
import adapter from '@sveltejs/adapter-bun';
import { sveltekit } from '@sveltejs/kit/vite';
import { sveltekitOG } from '@ethercorps/sveltekit-og/plugin';

const config = {
	plugins: [sveltekit({ adapter: adapter() }), sveltekitOG({ esmImport: false })]
};

export default config;
```

## Plugin Configuration

Use the `sveltekitOG` Vite plugin with `{ esmImport: false }`, exactly as on Node: the Wasm module is then loaded with Bun's Node-compatible file APIs instead of an ESM `.wasm` import. The plugin only touches the server bundle, so the [client-side entry](/docs/usage/client) keeps working alongside it.

## Build and run

Build with Bun (not Node) and start the generated server:

```json title="package.json" showLineNumbers
{
	"scripts": {
		"build": "bun run --bun vite build",
		"start": "bun ./build"
	}
}
```

```shell title="Bash"
bun run build
bun run start
```

The server listens on `PORT` (default `3000`). See the adapter docs for `HOST`, `SOCKET_PATH`, proxy headers and the other environment variables.

## Usage

Once configured, usage is the same as any other SvelteKit environment.

- Svelte Components: refer to the [Svelte Component](/docs/usage/svelte) usage.
- Raw HTML: refer to the [Raw HTML section](/docs/usage/html) for string templates.
- Takumi: refer to the [Takumi engine](/docs/usage/takumi) page.

## Preview (Self Test)

Source: https://github.com/etherCorps/sveltekit-og/tree/main/examples/bun-build

### Step-by-Step Guide

- Clone the repository and navigate:

```shell title="Bash"
git clone https://github.com/etherCorps/sveltekit-og.git
cd sveltekit-og/examples/bun-build
```

- Install dependencies:

```shell title="Bash"
pnpm install
```

- Build with Bun:

```shell title="Bash"
bun run build
```

- Start the server:

```shell title="Bash"
bun run start
```

Then open [http://localhost:3000](http://localhost:3000) to browse the example gallery — the **PNG**, **SVG** and **Takumi** routes, each as an HTML string, a Svelte component, and a pre-rendered image, plus the client-side renders.

More on how to use [adapter-bun in SvelteKit](https://svelte.dev/docs/kit/adapter-bun)
