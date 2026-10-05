<!-- Shared `/client` page for every example: one OG image rendered in the browser
     with `@ethercorps/sveltekit-og/client`, no server request. Default engine is
     Takumi; the satori-only example passes `engine="satori"`. -->
<script lang="ts">
	import ClientImage from './ClientImage.svelte';

	let { engine = 'takumi' }: { engine?: 'takumi' | 'satori' } = $props();

	let image: ClientImage;
	let url = $state<string | null>(null);
	let bytes = $state(0);
	let ms = $state(0);
</script>

<div class="page">
	<header class="hero">
		<div class="eyebrow">SvelteKit OG · examples · client-side</div>
		<h1>Client-side rendering</h1>
		<p class="lede">
			Rendered in your browser with <code>@ethercorps/sveltekit-og/client</code> — engine
			<strong>{engine}</strong>, no server request. Only this engine's WebAssembly was downloaded.
		</p>
		<div class="meta">
			<a class="chip link" href="/">← All examples</a>
			{#if url}
				<span class="chip">{(bytes / 1024).toFixed(1)} KB · {ms} ms</span>
				<button class="chip link" onclick={() => image.render()}>Re-render</button>
				<a class="chip link" href={url} download="og.png">Download</a>
			{/if}
		</div>
	</header>

	<div class="stage">
		<ClientImage
			bind:this={image}
			{engine}
			onrender={(info) => {
				url = info.url;
				bytes = info.bytes;
				ms = info.ms;
			}}
		/>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		background: #0a0a0f;
	}
	.page {
		--border: #262633;
		--text: #ececf1;
		--muted: #8b8b9a;
		min-height: 100vh;
		background:
			radial-gradient(1200px 600px at 50% -10%, #1a1a2e 0%, transparent 60%),
			#0a0a0f;
		color: var(--text);
		font-family:
			ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
		padding: 0 1.5rem 5rem;
	}
	.hero {
		max-width: 1120px;
		margin: 0 auto;
		padding: 5rem 0 2.5rem;
		text-align: center;
	}
	.eyebrow {
		font-size: 0.8rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
	}
	h1 {
		margin: 0.75rem 0 0;
		font-size: clamp(2rem, 5vw, 3.25rem);
		font-weight: 800;
		letter-spacing: -0.02em;
		background: linear-gradient(180deg, #fff, #b9b9cf);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	.lede {
		max-width: 44rem;
		margin: 1rem auto 0;
		font-size: 1.05rem;
		line-height: 1.6;
		color: var(--muted);
	}
	code {
		color: #c7c7ff;
	}
	.meta {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 1.25rem;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		padding: 0.35rem 0.8rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: #14141c;
		color: var(--muted);
		font: inherit;
		font-size: 0.85rem;
		text-decoration: none;
	}
	.chip.link {
		color: #c7c7ff;
		cursor: pointer;
	}
	.stage {
		max-width: 1120px;
		margin: 0 auto;
		border: 1px solid var(--border);
		border-radius: 14px;
		background: #14141c;
		overflow: hidden;
	}
</style>
