---
title: GitHub Repository OG Image
description: How to dynamically generate GitHub-style Open Graph images for repositories using Svelte components.
section: Examples
---

<script>
	import { Callout, DemoContainer } from "@svecodocs/kit";
    import SvelteComponentPlayground from "$lib/components/playground/svelte-component.svelte";
</script>

## Prerequisites

Ensure you have configured the **Vite/Rollup Plugin** as described in the [Getting Started](/docs/getting-started) section.

<Callout type="note" title="Dependencies">

This guide uses [phosphor-svelte](https://github.com/haruaki07/phosphor-svelte) for icons and Svelte 5 Runes syntax.

</Callout>

## Guide

In this guide, we will recreate the GitHub repository Open Graph image. We will create a reusable Svelte component and render it dynamically via an API endpoint.

GitHub OG Image:
<a target="_blank" rel="external" no-referrer="no-referrer" href="https://opengraph.githubassets.com/b127930b7d5e9d97f1321c31d6f1e42ad9a17cf649423ad26c9bfb2dee71fe5d/etherCorps/sveltekit-og">
<img src="https://opengraph.githubassets.com/b127930b7d5e9d97f1321c31d6f1e42ad9a17cf649423ad26c9bfb2dee71fe5d/etherCorps/sveltekit-og" class="mt-4 rounded-lg" alt="GitHub OG image">
</a>

### Create your Component

Create a standard Svelte component. You can use props to make it dynamic.

`src/lib/components/og.svelte`

```svelte
<script lang="ts">
	import Star from 'phosphor-svelte/lib/Star';
	import Contributors from 'phosphor-svelte/lib/Users';
	import Fork from 'phosphor-svelte/lib/GitFork';
	import SealWarning from 'phosphor-svelte/lib/SealWarning';
	import GithubLogo from 'phosphor-svelte/lib/GithubLogo';

	type Props = {
		logo: string;
		owner: string;
		repo: string;
		description: string;
		contributors: number;
		open_issues: number;
		stars: number;
		forks: number;
	};

	const { open_issues, owner, forks, repo, stars, description, contributors, logo }: Props =
		$props();

	const details = [
		{
			title: 'Contributors',
			count: contributors,
			icon: Contributors
		},
		{
			title: 'Stars',
			count: stars,
			icon: Star
		},
		{
			title: 'Fork',
			count: forks,
			icon: Fork
		},
		{
			title: 'Issues',
			count: open_issues,
			icon: SealWarning
		}
	];
</script>

<div class="flex flex-col w-full h-full bg-white">
	<div class="flex flex-col w-full h-[96%] px-16 pt-20 pb-10">
		<div class="flex flex-row items-center justify-between w-full h-1/2">
			<div class="flex flex-col w-1/2 items-start">
				<span class="text-gray-800 text-7xl leading-1.5">{owner}/</span>
				<span class="text-7xl font-bold">{repo}</span>
			</div>
			<img class="h-full" src={logo} />
		</div>
		<div class="flex flex-row w-[55%] mt-2">
			<span class="text-xl text-gray-600 leading-1.5 tracking-wide">{description}</span>
		</div>
		<div class="flex flex-row items-center justify-between w-full h-1/2">
			{#each details as detail (detail.title)}
				<div class="flex flex-row">
					<detail.icon class="w-8 h-8" />
					<div class="flex flex-col ml-2">
						<span class="text-gray-900 text-2xl">{detail.count}</span>
						<span class="text-gray-600 text-xl">{detail.title}</span>
					</div>
				</div>
			{/each}
			<div class="flex flex-row border-2 border-[#57bfbb] p-3 rounded-full">
				<GithubLogo class="w-8 h-8" color="#57bfbb" />
			</div>
		</div>
	</div>
	<div class="flex flex-row w-full h-7">
		<span class="flex bg-[#3178c6] w-9/12"></span>
		<span class="flex bg-[#f1e05b] w-2/12"></span>
		<span class="flex bg-[#ff3e00] w-1/12"></span>
	</div>
</div>
```

### Create API route

Create a server route to generate and serve the image.
You can pass the Svelte component directly to `ImageResponse`. The third argument accepts the `props` object.

`src/routes/og/+server.ts`

```typescript
import { ImageResponse } from '@ethercorps/sveltekit-og';
import { error, type RequestHandler } from '@sveltejs/kit';
import {
	getRepoDetails,
	type RepoDetailsError,
	type RepoDetailsResponse,
	cache,
	type RepoContributorsResponse
} from '../(github)/api';
import { tryCatch } from '$lib/try-catch';
import type { ImageResponseOptions } from '@ethercorps/sveltekit-og';
import OgComponent from './og.svelte';
import { fontsData } from '../(helpers)/fonts';
import type { ComponentProps } from 'svelte';

export const GET: RequestHandler = async ({ url }) => {
	const details = {
		owner: url.searchParams.get('owner') ?? 'etherCorps',
		repo: url.searchParams.get('repo') ?? 'sveltekit-og'
	};

	const cacheKey = `${details.owner}/${details.repo}`;
	let data = cache.get(cacheKey);

	if (!data) {
		const { data: response, error: githubError } = await tryCatch<
			{ repo: RepoDetailsResponse; contributors: RepoContributorsResponse },
			RepoDetailsError
		>(getRepoDetails(details));
		if (githubError) {
			error(githubError?.response?.data?.status || 500, {
				message: githubError?.response?.data?.message
			});
		}
		if (response && response.repo.data) {
			data = { ...response.repo.data, contributors_count: response.contributors.data.length };
			cache.set(`${details.owner}/${details.repo}`, data);
		}
	}

	const props: ComponentProps<typeof OgComponent> = {
		owner: data?.owner.login as string,
		repo: data?.name as string,
		description: String(data?.description),
		contributors: data?.contributors_count as number,
		forks: data?.forks as number,
		open_issues: data?.open_issues as number,
		stars: data?.stargazers_count as number,
		logo: data?.owner.avatar_url as string
	};

	const imageOptions: ImageResponseOptions = {
		width: 1200,
		height: 630,
		debug: false,
		fonts: await fontsData(),
		headers: {
			'Cache-Control': 'no-cache, no-store'
		}
	};

	return new ImageResponse(OgComponent, imageOptions, props);
};
```

## Preview

Start development server and visit the URL. You can change the query parameters to see the image update instantly in [playground](#playground).

<a target="_blank" rel="external" no-referrer="no-referrer" href="https://sveltekit-og.dev/svelte">
    <img src="/svelte?owner=etherCorps&repo=sveltekit-og" class="mt-4 rounded-lg border border-gray-200" alt="Generated OG Image">
</a>

## Using Vanilla CSS

The examples above use Tailwind CSS (via the `tw` prop or class names automatically handled by the library). However, you can also use standard CSS within your Svelte `<style>` blocks.

<Callout type="warning" title="Important">
  If using `style` blocks, you must enable CSS injection in your component options.

```svelte
<svelte:options css="injected" />
```

</Callout>

```svelte
<svelte:options css="injected" />

<script>
	// component logic
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

## Using Local Assets

When generating OG images, you cannot use relative paths (e.g., src="./logo.png") because the image generation happens on the server, not in a browser. The Satori engine cannot "see" your file system or resolve relative client-side paths.

To use local images, you must convert them into Base64 Data URLs. Fortunately, Vite makes this easy.

### The `?inline` Suffix

You can import any image file with the `?inline` suffix. This tells Vite to ignore its usual asset handling and instead provide the file's content as a Base64 string at build time.

#### usage in Svelte Components

```svelte
<script>
	// 1. Import with ?inline
	import myLogo from '$lib/assets/logo.png?inline';
</script>

<div tw="flex flex-col w-full h-full bg-white items-center justify-center">
	<img src={myLogo} width="100" height="100" alt="Logo" />
	<h1>My Website</h1>
</div>
```

### Using Public Folder Images

Technically, you can use images from your static folder, but you must provide the full absolute URL (e.g., https://your-site.com/logo.png).

Dev: http://localhost:5173/logo.png

Prod: https://example.com/logo.png

Since you likely don't know the absolute domain at build time (or in preview environments), we strongly recommend using the ?inline method described above.

## Playground

<DemoContainer class="flex flex-wrap gap-4">
	<SvelteComponentPlayground />
</DemoContainer>
