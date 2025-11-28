<script lang="ts">
	import LogoDark from '$lib/components/logos/dark.svelte';
	import { DocsLayout } from '@svecodocs/kit';
	import { getNavigationNeighbors, navigation } from '$lib/navigation';
	import { page } from '$app/state';

	let { children } = $props();

	const neighbors = $derived.by(() => getNavigationNeighbors(page.url.pathname))
</script>

<DocsLayout {navigation} {neighbors}>
	{#snippet logo()}
		<LogoDark class="block max-h-6" />
		<span class="">Sveltekit OG</span>
	{/snippet}

	{@render children?.()}
</DocsLayout>