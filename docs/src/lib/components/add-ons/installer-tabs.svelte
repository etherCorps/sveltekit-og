<script lang="ts">
	import { Tabs, TabItem } from "@svecodocs/kit";
	const managers = ["pnpm", "npm", "yarn", 'deno'];
	import type { Component } from 'svelte';

	type Props = {
		component: Component
		selected?: string
	}

	const {component: CommandComponent, selected}: Props = $props();



</script>

<Tabs value={selected ?? 'pnpm'} items={managers}>
	{#each managers as manager}
		<TabItem value={manager}>
			<CommandComponent packageManager={manager} />
		</TabItem>
	{/each}
</Tabs>