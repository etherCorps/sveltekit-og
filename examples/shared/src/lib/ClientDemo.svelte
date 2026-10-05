<!-- Shared `/client` page for every example: renders one OG image in the browser
     with `@ethercorps/sveltekit-og/client`, no server request. Default engine is
     Takumi; the satori-only example passes `engine="satori"`. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { createImage } from '@ethercorps/sveltekit-og/client';
	import { satoriTemplate, takumiTemplate } from './templates.js';

	let { engine = 'takumi' }: { engine?: 'takumi' | 'satori' } = $props();

	let url = $state<string | null>(null);
	let error = $state<string | null>(null);
	let bytes = $state(0);
	let ms = $state(0);

	async function render() {
		error = null;
		const provider = engine === 'satori' ? 'Satori · resvg' : 'Takumi';
		const template = engine === 'satori' ? satoriTemplate : takumiTemplate;
		const html = template({ provider, format: 'PNG', mode: 'Runtime', timestamp: new Date().toISOString() });
		const t0 = performance.now();
		try {
			const blob = await createImage(html, { engine, width: 1200, height: 630, format: 'png' }).blob();
			if (url) URL.revokeObjectURL(url);
			url = URL.createObjectURL(blob);
			bytes = blob.size;
			ms = Math.round(performance.now() - t0);
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

<div class="page">
	<header>
		<a class="back" href="/">← examples</a>
		<h1>Client-side rendering</h1>
		<p>
			Rendered in your browser with <code>@ethercorps/sveltekit-og/client</code> — engine
			<strong>{engine}</strong>, no server request. Only this engine's WebAssembly was downloaded.
		</p>
	</header>

	<div class="stage">
		{#if error}
			<pre class="error">{error}</pre>
		{:else if url}
			<img src={url} alt="Open Graph card rendered client-side" width="1200" height="630" />
		{:else}
			<span class="placeholder">Rendering…</span>
		{/if}
	</div>

	{#if url && !error}
		<div class="meta">
			<span>{(bytes / 1024).toFixed(1)} KB · {ms} ms</span>
			<button onclick={render}>Re-render</button>
			<a href={url} download="og.png">Download</a>
		</div>
	{/if}
</div>

<style>
	:global(body) {
		margin: 0;
	}
	.page {
		min-height: 100vh;
		background: #0a0a0f;
		color: #ececf1;
		font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
		padding: 3rem 1.5rem 5rem;
		max-width: 1120px;
		margin: 0 auto;
	}
	.back {
		color: #8b8b9a;
		text-decoration: none;
		font-size: 0.9rem;
	}
	h1 {
		margin: 0.75rem 0 0.5rem;
		font-size: 2rem;
		font-weight: 800;
		letter-spacing: -0.02em;
	}
	p {
		color: #8b8b9a;
		margin: 0 0 1.5rem;
	}
	code {
		color: #c7c7ff;
	}
	.stage {
		aspect-ratio: 1200 / 630;
		display: grid;
		place-items: center;
		border: 1px solid #262633;
		border-radius: 12px;
		background: #14141c;
		overflow: hidden;
	}
	.stage img {
		width: 100%;
		height: auto;
		display: block;
	}
	.placeholder {
		color: #8b8b9a;
	}
	.error {
		color: #fca5a5;
		white-space: pre-wrap;
		padding: 1rem;
		margin: 0;
	}
	.meta {
		display: flex;
		gap: 1rem;
		align-items: center;
		margin-top: 1rem;
		color: #8b8b9a;
		font-size: 0.9rem;
	}
	.meta a,
	.meta button {
		color: #c7c7ff;
		background: none;
		border: 1px solid #262633;
		border-radius: 999px;
		padding: 0.3rem 0.8rem;
		font: inherit;
		cursor: pointer;
		text-decoration: none;
	}
</style>
