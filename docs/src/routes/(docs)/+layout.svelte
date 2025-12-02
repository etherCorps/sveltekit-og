<script lang="ts">
	import LogoDark from '$lib/components/logos/dark.svelte';
	import { DocsLayout } from '@svecodocs/kit';
	import { navigation } from '$lib/navigation';

	let { children } = $props();

</script>

<DocsLayout {navigation}>
	{#snippet logo()}
		<LogoDark class="block max-h-6" />
		<span class="">Sveltekit OG</span>
	{/snippet}

	{@render children?.()}
</DocsLayout>