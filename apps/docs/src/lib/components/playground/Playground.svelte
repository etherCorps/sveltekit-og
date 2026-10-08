<!--
  Hallmark · genre: modern-minimal · macrostructure: Component Playground · theme: project tokens (svecodocs rose)
  tone: technical · enrichment: none · nav/footer: inherited (DocsLayout)
  audience: SvelteKit devs evaluating the client API · use: render in-browser, copy the call
  pre-emit critique: P4 H4 E4 S4 R5 V4 · slop: pass (58/58; gate 1 Inter is the preserved project font) · contrast: pass (40–41) · mobile: pass (34, 49–57 @ 320/375/414/768)
-->
<script lang="ts">
	import { createImage, type ClientImageResponseOptions } from '@ethercorps/sveltekit-og/client';
	import { Button, Input, Label, Textarea } from '@svecodocs/kit';
	import Check from 'phosphor-svelte/lib/Check';
	import Copy from 'phosphor-svelte/lib/Copy';
	import DownloadSimple from 'phosphor-svelte/lib/DownloadSimple';
	import Card from './Card.svelte';
	import { DEFAULT_EXAMPLE, examples, type Engine, type Example } from './examples.js';

	// takumi encodes more raster formats than satori; only preview-able ones are listed
	const FORMATS: Record<Engine, string[]> = {
		takumi: ['png', 'jpeg', 'webp', 'svg'],
		satori: ['png', 'svg']
	};

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

	let copyTimer: ReturnType<typeof setTimeout> | undefined;
	async function copySnippet() {
		await navigator.clipboard.writeText(snippet);
		copied = true;
		clearTimeout(copyTimer);
		copyTimer = setTimeout(() => (copied = false), 2500);
	}

	const field =
		'h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-sm text-foreground dark:bg-muted hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-55';
	const chip =
		'inline-flex h-9 items-center whitespace-nowrap rounded-full border px-3.5 text-sm font-medium transition-colors duration-150 pointer-coarse:min-h-11 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-55';
</script>

<section class="mx-auto w-full min-w-0 max-w-[1200px] pb-16">
	<header class="max-w-[62ch]">
		<h1 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Playground</h1>
		<p class="mt-3 text-base leading-relaxed text-muted-foreground">
			Every render happens in this tab — nothing is sent to a server. Pick a template, change
			what you like, then copy the call.
		</p>
	</header>

	<!-- Templates -->
	<div class="mt-8 flex flex-wrap gap-2" role="group" aria-label="Templates">
		{#each examples as ex (ex.id)}
			<button
				type="button"
				class="{chip} {ex.id === exampleId
					? 'border-foreground bg-foreground text-background'
					: 'border-border bg-background text-foreground hover:bg-foreground/5 dark:bg-muted'}"
				aria-pressed={ex.id === exampleId}
				onclick={() => selectExample(ex)}
			>
				{ex.label}
			</button>
		{/each}
	</div>
	<p class="mt-2 min-h-[1lh] text-sm text-muted-foreground">{example.hint}</p>

	<div class="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
		<!-- Controls + editor -->
		<div class="flex min-w-0 flex-col gap-5">
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
						class="min-h-[280px] resize-y font-mono text-xs leading-relaxed"
						spellcheck={false}
						bind:value={html}
					/>
				</div>
			{/if}
		</div>

		<!-- Preview + snippet -->
		<div class="flex min-w-0 flex-col gap-5">
			<div class="flex flex-col gap-1.5">
				<div class="flex min-h-9 items-center justify-between">
					<span class="text-sm font-medium leading-none text-foreground">Preview</span>
					<span
						class="text-sm tabular-nums text-muted-foreground"
						aria-live="polite"
					>
						{#if url && !error}
							{(bytes / 1024).toFixed(1)} KB · {ms} ms
						{:else if loading}
							Rendering…
						{/if}
					</span>
				</div>
				<figure
					class="relative m-0 aspect-[1200/630] overflow-hidden rounded-xl border border-border bg-muted/40 transition-opacity duration-150 ease-out motion-reduce:transition-none {loading &&
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
				<div class="flex min-h-10 items-center justify-end">
					{#if url && !error}
						<Button variant="outline" size="sm" href={url} download={downloadName}>
							<DownloadSimple class="size-4" aria-hidden="true" />
							Download
						</Button>
					{/if}
				</div>
			</div>

			<div class="flex flex-col gap-1.5">
				<div class="flex min-h-9 items-center justify-between">
					<span class="text-sm font-medium leading-none text-foreground">Code</span>
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
				<pre
					class="m-0 min-w-0 overflow-x-auto rounded-xl border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground"><code>{snippet}</code></pre>
			</div>
		</div>
	</div>
</section>
