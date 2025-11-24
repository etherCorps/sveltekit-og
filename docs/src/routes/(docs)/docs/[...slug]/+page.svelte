<script lang="ts">
	import { DocPage } from '@svecodocs/kit';
	import type { ComponentProps } from 'svelte';
	let { data } = $props();
	const metadata: ComponentProps<typeof DocPage>['metadata'] = $derived({
		ogImage: {
			url: `/api/og/image/${data.metadata.slug}.png`,
			height: '630',
			width: '1200'
		}
	})
</script>

<DocPage component={data.component} {...data.metadata} {metadata}/>
