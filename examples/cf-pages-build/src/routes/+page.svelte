<script lang="ts">
	const version = '4.3.0-next.14';

	type Route = { kind: string; label: string; href: string };
	type Section = {
		title: string;
		tagline: string;
		accent: 'indigo' | 'emerald' | 'violet';
		routes: Route[];
	};

	const sections: Section[] = [
		{
			title: 'Resvg PNG',
			tagline: 'HTML → Satori → resvg. Rasterized PNG output.',
			accent: 'indigo',
			routes: [
				{ kind: 'Default', label: 'HTML string', href: '/png/default.png' },
				{ kind: 'Component', label: 'Svelte component', href: '/png/cog.png' },
				{ kind: 'Pre-rendered', label: 'Built at compile time', href: '/png/prerendered.png' }
			]
		},
		{
			title: 'Satori SVG',
			tagline: 'HTML → Satori. Vector SVG, no rasterization.',
			accent: 'emerald',
			routes: [
				{ kind: 'Default', label: 'HTML string', href: '/svg/default.svg' },
				{ kind: 'Component', label: 'Svelte component', href: '/svg/cog.svg' },
				{ kind: 'Pre-rendered', label: 'Built at compile time', href: '/svg/prerendered.svg' }
			]
		},
		{
			title: 'Takumi',
			tagline: 'Rust / WASM engine. Add ?format=webp · jpeg · svg to switch output.',
			accent: 'violet',
			routes: [
				{ kind: 'Default', label: 'HTML string', href: '/takumi/default' },
				{ kind: 'Component', label: 'Svelte component', href: '/takumi/cog' },
				{ kind: 'Pre-rendered', label: 'Built at compile time', href: '/takumi/prerendered' }
			]
		}
	];
</script>

<div class="page">
	<header class="hero">
		<div class="eyebrow">SvelteKit OG · examples · adapter-cloudflare · Pages</div>
		<h1>@ethercorps/sveltekit-og</h1>
		<p class="lede">
			Three rendering engines, each in three flavours — an HTML string, a Svelte component, and a
			pre-rendered build-time image.
		</p>
		<div class="meta">
			<span class="chip">v{version}</span>
			<a class="chip link" href="https://sveltekit-og.dev" target="_blank" rel="noreferrer"
				>Docs ↗</a
			>
			<a
				class="chip link"
				href="https://github.com/ethercorps/sveltekit-og"
				target="_blank"
				rel="noreferrer"
			>
				GitHub ↗
			</a>
		</div>
	</header>

	{#each sections as section (section.title)}
		<section class="section" data-accent={section.accent}>
			<div class="section-head">
				<span class="dot"></span>
				<h2>{section.title}</h2>
				<p>{section.tagline}</p>
			</div>
			<div class="grid">
				{#each section.routes as route (route.href)}
					<a class="card" href={route.href}>
						<div class="thumb">
							<img src={route.href} alt={`${section.title} — ${route.label}`} loading="lazy" />
						</div>
						<div class="body">
							<span class="kind">{route.kind}</span>
							<span class="label">{route.label}</span>
							<code class="path">{route.href}</code>
						</div>
					</a>
				{/each}
			</div>
		</section>
	{/each}

	<footer class="foot">
		Generated with
		<a href="https://sveltekit-og.dev" target="_blank" rel="noreferrer">@ethercorps/sveltekit-og</a>
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
	}

	.page {
		--bg: #0a0a0f;
		--panel: #14141c;
		--panel-2: #1b1b25;
		--border: #262633;
		--text: #ececf1;
		--muted: #8b8b9a;
		min-height: 100vh;
		background: radial-gradient(1200px 600px at 50% -10%, #1a1a2e 0%, transparent 60%), var(--bg);
		color: var(--text);
		font-family:
			ui-sans-serif,
			system-ui,
			-apple-system,
			'Segoe UI',
			Roboto,
			sans-serif;
		padding: 0 1.5rem 5rem;
	}

	.hero {
		max-width: 1120px;
		margin: 0 auto;
		padding: 5rem 0 3rem;
		text-align: center;
	}
	.eyebrow {
		font-size: 0.8rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.hero h1 {
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
	.meta {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 1.5rem;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		padding: 0.35rem 0.8rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: var(--panel);
		font-size: 0.85rem;
		color: var(--text);
		text-decoration: none;
	}
	.chip.link:hover {
		border-color: #3d3d52;
		background: var(--panel-2);
	}

	.section {
		max-width: 1120px;
		margin: 3rem auto 0;
	}
	.section-head {
		display: grid;
		grid-template-columns: auto auto 1fr;
		align-items: baseline;
		gap: 0.65rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border);
	}
	.dot {
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 999px;
		background: var(--accent);
		align-self: center;
		box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 22%, transparent);
	}
	.section-head h2 {
		margin: 0;
		font-size: 1.35rem;
		font-weight: 700;
		letter-spacing: -0.01em;
	}
	.section-head p {
		margin: 0;
		color: var(--muted);
		font-size: 0.9rem;
	}

	[data-accent='indigo'] {
		--accent: #6366f1;
	}
	[data-accent='emerald'] {
		--accent: #10b981;
	}
	[data-accent='violet'] {
		--accent: #a855f7;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.1rem;
		margin-top: 1.25rem;
	}
	.card {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--border);
		border-radius: 0.9rem;
		overflow: hidden;
		background: var(--panel);
		text-decoration: none;
		color: inherit;
		transition:
			transform 0.15s ease,
			border-color 0.15s ease,
			box-shadow 0.15s ease;
	}
	.card:hover {
		transform: translateY(-3px);
		border-color: var(--accent);
		box-shadow: 0 12px 30px -12px color-mix(in srgb, var(--accent) 55%, transparent);
	}
	.thumb {
		aspect-ratio: 1200 / 630;
		background:
			linear-gradient(45deg, #101017 25%, transparent 25%) -8px 0 / 16px 16px,
			linear-gradient(-45deg, #101017 25%, transparent 25%) -8px 0 / 16px 16px,
			#0c0c12;
		border-bottom: 1px solid var(--border);
	}
	.thumb img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.body {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 0.85rem 1rem 1rem;
	}
	.kind {
		align-self: flex-start;
		padding: 0.15rem 0.55rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--accent) 16%, transparent);
		color: color-mix(in srgb, var(--accent) 80%, white);
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		text-transform: uppercase;
	}
	.label {
		font-size: 0.95rem;
		font-weight: 600;
	}
	.path {
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		font-size: 0.8rem;
		color: var(--muted);
	}

	.foot {
		max-width: 1120px;
		margin: 4rem auto 0;
		text-align: center;
		color: var(--muted);
		font-size: 0.9rem;
	}
	.foot a {
		color: #b9b9cf;
	}
</style>
