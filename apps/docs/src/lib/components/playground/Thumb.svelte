<!-- One template thumbnail for the "Pick a template" stage. Rendered once on mount with
     Takumi at the template's native 1200×630 (the templates use fixed type sizes, so a
     smaller canvas would crop them) and scaled down by CSS; never re-rendered by the controls. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { createImage } from '@ethercorps/sveltekit-og/client';
	import type { Component } from 'svelte';

	let {
		html = '',
		component,
		props = {},
		alt
	}: { html?: string; component?: Component<any>; props?: Record<string, unknown>; alt: string } =
		$props();

	let url = $state<string | null>(null);
	let failed = $state(false);

	onMount(() => {
		let objectUrl: string | null = null;
		(async () => {
			try {
				const element = component ?? html;
				const blob = await createImage(element as never, { engine: 'takumi', width: 1200, height: 630, format: 'png' }, props as never).blob();
				objectUrl = URL.createObjectURL(blob);
				url = objectUrl;
			} catch {
				failed = true;
			}
		})();
		return () => {
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	});
</script>

{#if url}
	<img src={url} {alt} width="1200" height="630" class="block h-auto w-full" />
{:else if failed}
	<div class="grid aspect-[1200/630] w-full place-items-center text-xs text-muted-foreground">no preview</div>
{:else}
	<div class="aspect-[1200/630] w-full animate-pulse bg-muted" aria-hidden="true"></div>
{/if}
