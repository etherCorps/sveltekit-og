<script lang="ts">
	import { DocPage } from '@svecodocs/kit';
	import type { ComponentProps } from 'svelte';
	import { getNavigationNeighbors } from '$lib/navigation';
	import { page } from '$app/state';
	let { data } = $props();
	const metadata: ComponentProps<typeof DocPage>['metadata'] = $derived({
		ogImage: {
			url: `/api/og/image/${data.metadata.slug}.png`,
			height: '630',
			width: '1200'
		}
	});

	const neighbors = $derived.by(() => getNavigationNeighbors(page.url.pathname));
</script>

<DocPage component={data.component} {...data.metadata} {metadata} {neighbors} />
