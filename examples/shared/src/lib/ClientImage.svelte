<!-- Renders one OG image in the browser with `@ethercorps/sveltekit-og/client` and
     shows it as an <img>. Used both as a thumbnail on the examples' index page and
     as the stage on /client. Server-side it only emits the placeholder. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { createImage } from '@ethercorps/sveltekit-og/client';
	import { satoriTemplate, takumiTemplate } from './templates.js';

	type Info = { url: string; bytes: number; ms: number };
	let {
		engine = 'takumi',
		alt = 'Open Graph card rendered client-side',
		onrender
	}: { engine?: 'takumi' | 'satori'; alt?: string; onrender?: (info: Info) => void } = $props();

	let url = $state<string | null>(null);
	let error = $state<string | null>(null);

	export async function render() {
		error = null;
		const provider = engine === 'satori' ? 'Satori · resvg' : 'Takumi';
		const template = engine === 'satori' ? satoriTemplate : takumiTemplate;
		const html = template({ provider, format: 'PNG', mode: 'Runtime', timestamp: new Date().toISOString() });
		const t0 = performance.now();
		try {
			const blob = await createImage(html, { engine, width: 1200, height: 630, format: 'png' }).blob();
			if (url) URL.revokeObjectURL(url);
			url = URL.createObjectURL(blob);
			onrender?.({ url, bytes: blob.size, ms: Math.round(performance.now() - t0) });
		} catch (e) {
			const err = e as { code?: string; message?: string };
			error = `${err.code ?? 'ERROR'}: ${err.message ?? String(e)}`;
		}
	}

	onMount(() => {
		render();
		return () => {
			if (url) URL.revokeObjectURL(url);
		};
	});
</script>

{#if error}
	<pre class="error">{error}</pre>
{:else if url}
	<img src={url} {alt} width="1200" height="630" />
{:else}
	<span class="placeholder">Rendering in browser…</span>
{/if}

<style>
	img {
		width: 100%;
		height: auto;
		display: block;
	}
	.placeholder,
	.error {
		display: grid;
		place-items: center;
		aspect-ratio: 1200 / 630;
		margin: 0;
		padding: 1rem;
		color: #8b8b9a;
		font-size: 0.9rem;
	}
	.error {
		color: #fca5a5;
		white-space: pre-wrap;
	}
</style>
