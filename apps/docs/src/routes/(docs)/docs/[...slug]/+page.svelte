<script lang="ts">
	import { DocPage } from '@svecodocs/kit';
	import type { ComponentProps } from 'svelte';
	import { getNavigationNeighbors } from '$lib/navigation';
	import { page } from '$app/state';
	import VersionBanner from '$lib/components/version-banner.svelte';
	import { v5Url } from '$lib/v5-url';
	let { data } = $props();
	const metadata: ComponentProps<typeof DocPage>['metadata'] = $derived({
		ogImage: {
			url: `/api/og/image/${data.metadata.slug}.png`,
			height: '630',
			width: '1200'
		}
	});

	const neighbors = $derived.by(() => getNavigationNeighbors(page.url.pathname));
	const canonical = $derived(v5Url(page.url.pathname));
</script>

<svelte:head>
	<link rel="canonical" href={canonical} />
</svelte:head>

<VersionBanner {canonical} />
<DocPage component={data.component} {...data.metadata} {metadata} {neighbors} />
