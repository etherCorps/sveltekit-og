<!--
  Hallmark · genre: modern-minimal · macrostructure: Narrative Workflow · theme: project tokens (svecodocs rose)
  tone: technical · enrichment: none · nav/footer: inherited (DocsLayout) · redesign of: Component Playground (2026-10-08)
  audience: SvelteKit devs evaluating the client API · use: render in-browser, copy the call
  pre-emit critique: P4 H5 E4 S4 R4 V5 · slop: pass (58/58; gate 1 Inter is the preserved project font; stage numbers are the macrostructure's heading device, stacked per gate 54) · contrast: pass (40–41) · mobile: pass (34, 49–57 @ 320/375/414/768)
-->
<script lang="ts">
	import { createImage, type ClientImageResponseOptions } from '@ethercorps/sveltekit-og/client';
	import { Button, Input, Label, Textarea } from '@svecodocs/kit';
	import { language } from '@twinkleplop/typescript';
	import '@twinkleplop/theme-github';
	import Check from 'phosphor-svelte/lib/Check';
	import Copy from 'phosphor-svelte/lib/Copy';
	import DownloadSimple from 'phosphor-svelte/lib/DownloadSimple';
	import Card from './Card.svelte';
	import Thumb from './Thumb.svelte';
	import { DEFAULT_EXAMPLE, examples, type Engine, type Example } from './examples.js';

	// takumi encodes more raster formats than satori; only preview-able ones are listed
	const FORMATS: Record<Engine, string[]> = {
		takumi: ['png', 'jpeg', 'webp', 'svg'],
		satori: ['png', 'svg']
	};

	const highlight = language();

	let engine = $state<Engine>('takumi');
	let format = $state('png');
	let width = $state(1200);
	let height = $state(630);
	let quality = $state(90);

	let exampleId = $state(DEFAULT_EXAMPLE.id);
	let html = $state(DEFAULT_EXAMPLE.html);
	let title = $state('Open Graph, from a component');
	let subtitle = $state('Rendered in your browser');
	let tag = $state('sveltekit-og');

	let url = $state<string | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let bytes = $state(0);
	let ms = $state(0);
	let copied = $state(false);

	const example = $derived<Example>(examples.find((e) => e.id === exampleId) ?? DEFAULT_EXAMPLE);
	const isComponent = $derived(example.id === 'component');
	const formats = $derived(FORMATS[engine]);
	const showQuality = $derived(engine === 'takumi' && (format === 'jpeg' || format === 'webp'));

	function selectExample(next: Example) {
		exampleId = next.id;
		if (next.html) html = next.html;
	}

	// keep format valid when the engine (and its format list) changes
	function onEngineChange() {
		if (!FORMATS[engine].includes(format)) format = 'png';
	}

	// current object URL, kept across renders so we only revoke the old one once its
	// replacement is ready (revoking in the effect cleanup would blank the visible image)
	let objectUrl: string | null = null;

	$effect(() => {
		// read every reactive dep synchronously so the effect re-runs on any change
		const element = isComponent ? Card : html;
		const props = isComponent ? { title, subtitle, tag } : undefined;
		const opts = {
			engine,
			format,
			width,
			height,
			...(showQuality ? { quality } : {})
		} as ClientImageResponseOptions;

		loading = true;
		error = null;

		// debounce so typing in the editor doesn't fire a wasm render per keystroke
		const timer = setTimeout(async () => {
			const t0 = performance.now();
			try {
				const blob = await createImage(element as never, opts, props as never).blob();
				const next = URL.createObjectURL(blob);
				if (objectUrl) URL.revokeObjectURL(objectUrl);
				objectUrl = next;
				url = next;
				bytes = blob.size;
				ms = Math.round(performance.now() - t0);
			} catch (e) {
				const err = e as { code?: string; message?: string };
				error = `${err.code ?? 'ERROR'}: ${err.message ?? String(e)}`;
			} finally {
				loading = false;
			}
		}, 300);

		// cancel a still-pending render; keep the current image until its replacement lands
		return () => clearTimeout(timer);
	});

	// release the last object URL when the page is destroyed
	$effect(() => () => {
		if (objectUrl) URL.revokeObjectURL(objectUrl);
	});

	const downloadName = $derived(`og.${format === 'jpeg' ? 'jpg' : format}`);

	const snippet = $derived.by(() => {
		const opts = [
			`engine: '${engine}'`,
			`format: '${format}'`,
			`width: ${width}`,
			`height: ${height}`,
			...(showQuality ? [`quality: ${quality}`] : [])
		].join(',\n  ');
		const head = `import { createImage } from '@ethercorps/sveltekit-og/client';`;
		const tail = `const url = URL.createObjectURL(await res.blob());`;
		if (isComponent) {
			const props = [
				`title: ${JSON.stringify(title)}`,
				`subtitle: ${JSON.stringify(subtitle)}`,
				`tag: ${JSON.stringify(tag)}`
			].join(',\n  ');
			return `${head}\nimport Card from './Card.svelte';\n\nconst res = createImage(\n  Card,\n  {\n    ${opts.replaceAll('\n  ', '\n    ')}\n  },\n  {\n    ${props.replaceAll('\n  ', '\n    ')}\n  }\n);\n${tail}`;
		}
		return `${head}\n\nconst html = \`…\`; // the HTML from the editor\nconst res = createImage(html, {\n  ${opts}\n});\n${tail}`;
	});
	const snippetHtml = $derived(highlight(snippet));

	let copyTimer: ReturnType<typeof setTimeout> | undefined;
	async function copySnippet() {
		await navigator.clipboard.writeText(snippet);
		copied = true;
		clearTimeout(copyTimer);
		copyTimer = setTimeout(() => (copied = false), 2500);
	}

	const field =
		'h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-sm text-foreground dark:bg-muted hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-55';
	const card =
		'group flex min-w-0 flex-col overflow-hidden rounded-xl border text-left transition-colors duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-55';
</script>

{#snippet stage(n: string, heading: string, lede: string)}
	<!-- thick numbered rule, then the heading stacked beneath it in the same column -->
	<div class="flex items-center gap-3" aria-hidden="true">
		<span class="font-mono text-sm tabular-nums text-muted-foreground">{n}</span>
		<span class="h-[3px] min-w-0 flex-1 rounded-full bg-foreground"></span>
	</div>
	<h2 class="mt-3 text-xl font-semibold tracking-tight text-foreground">
		<span class="sr-only">Stage {n}: </span>{heading}
	</h2>
	<p class="mt-1 text-sm text-muted-foreground">{lede}</p>
{/snippet}

<section class="mx-auto w-full min-w-0 max-w-[1200px] pb-16">
	<header class="max-w-[62ch]">
		<h1 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Playground</h1>
		<p class="mt-3 text-base leading-relaxed text-muted-foreground">
			Four steps, all in this tab — nothing is sent to a server. Pick a template, tune it,
			watch the preview, take the code.
		</p>
	</header>

	<div class="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-[auto_auto_auto] lg:gap-x-12">
		<!-- 1 · Pick -->
		<div class="min-w-0 lg:col-start-1 lg:row-start-1">
			{@render stage('01', 'Pick a template', 'Five starting points. Each is rendered right here, by the default engine.')}
			<div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3" role="group" aria-label="Templates">
				{#each examples as ex (ex.id)}
					<button
						type="button"
						class="{card} {ex.id === exampleId
							? 'border-brand ring-2 ring-brand'
							: 'border-border hover:border-foreground/40'}"
						aria-pressed={ex.id === exampleId}
						onclick={() => selectExample(ex)}
					>
						<div class="bg-muted/40">
							{#if ex.id === 'component'}
								<Thumb component={Card} alt="" />
							{:else}
								<Thumb html={ex.html} alt="" />
							{/if}
						</div>
						<span class="px-3 py-2 text-sm font-medium text-foreground">{ex.label}</span>
					</button>
				{/each}
			</div>
			<p class="mt-3 min-h-[1lh] text-sm text-muted-foreground">{example.hint}</p>
		</div>

		<!-- 2 · Tune -->
		<div class="min-w-0 lg:col-start-1 lg:row-start-2">
			{@render stage('02', 'Tune it', 'Engine, output format and size apply to every render. Satori emits png or svg; Takumi adds jpeg and webp.')}
			<div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
				<div class="flex flex-col gap-1.5">
					<Label for="pg-engine">Engine</Label>
					<select id="pg-engine" class={field} bind:value={engine} onchange={onEngineChange}>
						<option value="takumi">takumi</option>
						<option value="satori">satori</option>
					</select>
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="pg-format">Format</Label>
					<select id="pg-format" class={field} bind:value={format}>
						{#each formats as f (f)}
							<option value={f}>{f}</option>
						{/each}
					</select>
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="pg-width">Width</Label>
					<Input id="pg-width" type="number" min="1" inputmode="numeric" bind:value={width} />
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="pg-height">Height</Label>
					<Input id="pg-height" type="number" min="1" inputmode="numeric" bind:value={height} />
				</div>
				{#if showQuality}
					<div class="col-span-2 flex flex-col gap-1.5 sm:col-span-4">
						<Label for="pg-quality">Quality · {quality}</Label>
						<input
							id="pg-quality"
							type="range"
							min="1"
							max="100"
							bind:value={quality}
							class="h-10 w-full accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
						/>
					</div>
				{/if}
			</div>

			<div class="mt-5">
				{#if isComponent}
					<div class="grid gap-3">
						<div class="flex flex-col gap-1.5">
							<Label for="pg-title">title</Label>
							<Input id="pg-title" bind:value={title} />
						</div>
						<div class="flex flex-col gap-1.5">
							<Label for="pg-subtitle">subtitle</Label>
							<Input id="pg-subtitle" bind:value={subtitle} />
						</div>
						<div class="flex flex-col gap-1.5">
							<Label for="pg-tag">tag</Label>
							<Input id="pg-tag" bind:value={tag} />
						</div>
					</div>
				{:else}
					<div class="flex flex-col gap-1.5">
						<Label for="pg-html">HTML</Label>
						<Textarea
							id="pg-html"
							class="min-h-[260px] resize-y font-mono text-xs leading-relaxed"
							spellcheck={false}
							bind:value={html}
						/>
					</div>
				{/if}
			</div>
		</div>

		<!-- 3 · Preview — sticky beside stages 1–2 on wide screens, in sequence on narrow ones -->
		<aside class="min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-3">
			<div class="lg:sticky lg:top-24">
				{@render stage('03', 'Preview', 'Re-renders as you change anything above.')}
				<div class="mt-5 flex min-h-5 items-center justify-end">
					<span class="text-sm tabular-nums text-muted-foreground" aria-live="polite">
						{#if url && !error}
							{(bytes / 1024).toFixed(1)} KB · {ms} ms
						{:else if loading}
							Rendering…
						{/if}
					</span>
				</div>
				<figure
					class="relative m-0 mt-2 aspect-[1200/630] overflow-hidden rounded-xl border border-border bg-muted/40 transition-opacity duration-150 ease-out motion-reduce:transition-none {loading &&
					url
						? 'opacity-60'
						: ''}"
				>
					{#if error}
						<pre
							class="m-0 h-full overflow-auto whitespace-pre-wrap p-4 font-mono text-xs leading-relaxed text-destructive">{error}</pre>
					{:else if url}
						<img src={url} alt="Rendered Open Graph preview" class="h-full w-full object-contain" />
					{:else}
						<div class="h-full w-full animate-pulse bg-muted" aria-hidden="true"></div>
					{/if}
				</figure>
				<div class="mt-3 flex min-h-10 items-center justify-end">
					{#if url && !error}
						<Button variant="outline" size="sm" href={url} download={downloadName}>
							<DownloadSimple class="size-4" aria-hidden="true" />
							Download
						</Button>
					{/if}
				</div>
			</div>
		</aside>

		<!-- 4 · Code -->
		<div class="min-w-0 lg:col-start-1 lg:row-start-3">
			{@render stage('04', 'Take the code', 'The exact call behind the preview. Drop it into any page that runs in the browser.')}
			<div class="mt-5 flex min-h-9 items-center justify-between">
				<span class="text-sm font-medium leading-none text-foreground">createImage</span>
				<Button variant="subtle" size="sm" onclick={copySnippet} aria-live="polite">
					{#if copied}
						<Check class="size-4" aria-hidden="true" />
						Copied
					{:else}
						<Copy class="size-4" aria-hidden="true" />
						Copy
					{/if}
				</Button>
			</div>
			<!-- {@html} is safe here: twinkleplop escapes its input, and the input is the snippet
			     string built above (user-typed props pass through JSON.stringify first). -->
			<div class="code mt-2 min-w-0 overflow-x-auto rounded-xl border border-border bg-muted/40">
				{@html snippetHtml}
			</div>
			<p class="mt-4 text-sm text-muted-foreground">Install, then import from the client entry:</p>
			<pre
				class="mt-2 overflow-x-auto rounded-xl border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground"><code>npm i @ethercorps/sveltekit-og@next takumi-js</code></pre>
		</div>
	</div>
</section>

<style>
	/* twinkleplop emits <pre class="twinkleplop"><code>…; the theme sets token colours and a
	   paper background — we supply the surface, so only the box styling lives here. */
	.code :global(pre.twinkleplop) {
		margin: 0;
		padding: 1rem;
		background: transparent;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		line-height: 1.6;
	}
</style>
