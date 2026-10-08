<!--
  Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: project tokens (svecodocs rose)
  tone: technical · enrichment: none · nav/footer: inherited (DocsLayout) · redesign of: Narrative Workflow (2026-10-08)
  audience: SvelteKit devs evaluating the client API · use: edit, see, copy the call
  shape: toolbar → editor | preview → code drawer; one screen on lg, Edit·Preview·Code tabs below
  pre-emit critique: P5 H5 E4 S5 R5 V5 · slop: pass (58/58; gate 1 Inter is the preserved project font; no section tags) · contrast: pass (40–41) · mobile: pass (34, 49–57 @ 320/375/414/768)
-->
<script lang="ts">
	import { createImage, type ClientImageResponseOptions } from '@ethercorps/sveltekit-og/client';
	import { Button, Input, Label } from '@svecodocs/kit';
	import { Pane, PaneGroup, PaneResizer } from 'paneforge';
	import { MediaQuery } from 'svelte/reactivity';
	import { language } from '@twinkleplop/typescript';
	import '@twinkleplop/theme-github';
	import ArrowCounterClockwise from 'phosphor-svelte/lib/ArrowCounterClockwise';
	import CaretDown from 'phosphor-svelte/lib/CaretDown';
	import Check from 'phosphor-svelte/lib/Check';
	import Copy from 'phosphor-svelte/lib/Copy';
	import DownloadSimple from 'phosphor-svelte/lib/DownloadSimple';
	import Card from './Card.svelte';
	import Thumb from './Thumb.svelte';
	import HtmlEditor from './HtmlEditor.svelte';
	import cardSource from './Card.svelte?raw';
	import { DEFAULT_EXAMPLE, examples, type Engine, type Example } from './examples.js';

	// takumi encodes more raster formats than satori; only preview-able ones are listed
	const FORMATS: Record<Engine, string[]> = {
		takumi: ['png', 'jpeg', 'webp', 'svg'],
		satori: ['png', 'svg']
	};
	const ENGINES: Engine[] = ['takumi', 'satori'];
	const INSTALL = 'npm i @ethercorps/sveltekit-og@next takumi-js';

	const highlight = language();
	// the component template shows Card.svelte's markup read-only; strip the <script> block
	const cardMarkup = cardSource.replace(/<!--[\s\S]*?-->\s*/, '').replace(/<script[\s\S]*?<\/script>\s*/, '').trim();

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
	// lg: resizable panes, all visible. Below: one pane at a time, picked by tabs.
	const lg = new MediaQuery('(min-width: 64rem)');
	let view = $state<'edit' | 'image' | 'browser' | 'code'>('image');
	let frameWidth = $state(0);
	let picker = $state<HTMLDivElement>();

	const example = $derived<Example>(examples.find((e) => e.id === exampleId) ?? DEFAULT_EXAMPLE);
	const isComponent = $derived(example.id === 'component');
	const formats = $derived(FORMATS[engine]);
	const showQuality = $derived(engine === 'takumi' && (format === 'jpeg' || format === 'webp'));
	const dirty = $derived(!isComponent && html !== example.html);
	const tabs = $derived<[typeof view, string][]>([
		['edit', isComponent ? 'Props' : 'Edit'],
		['image', engine],
		['browser', 'Browser'],
		['code', 'Code']
	]);

	function selectExample(next: Example) {
		exampleId = next.id;
		if (next.html) html = next.html;
		picker?.hidePopover();
	}

	function setEngine(next: Engine) {
		engine = next;
		// keep format valid when the engine (and its format list) changes
		if (!FORMATS[next].includes(format)) format = 'png';
	}

	// ⌘/Ctrl+Enter in the editor renders without waiting for the debounce
	let delay = 300;
	let nonce = $state(0);
	function onkeydown(e: KeyboardEvent) {
		if (e.key !== 'Enter' || !(e.metaKey || e.ctrlKey)) return;
		e.preventDefault();
		delay = 0;
		nonce++;
	}

	// current object URL, kept across renders so we only revoke the old one once its
	// replacement is ready (revoking in the effect cleanup would blank the visible image)
	let objectUrl: string | null = null;

	$effect(() => {
		// read every reactive dep synchronously so the effect re-runs on any change
		void nonce;
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
				const err = e as { code?: string; message?: string; originalError?: Error };
				// ImageResponseError wraps the engine's own error; its message is the useful one
				const cause = err.originalError?.message;
				error = `${err.code ?? 'ERROR'}: ${err.message ?? String(e)}${cause && cause !== err.message ? `\n\n${cause}` : ''}`;
			} finally {
				loading = false;
			}
		}, delay);
		delay = 300;

		// cancel a still-pending render; keep the current image until its replacement lands
		return () => clearTimeout(timer);
	});

	// release the last object URL when the page is destroyed
	$effect(() => () => {
		if (objectUrl) URL.revokeObjectURL(objectUrl);
	});

	const downloadName = $derived(`og.${format === 'jpeg' ? 'jpg' : format}`);

	// frame width: fill the shell, but never taller than it. cqh resolves against the shell's
	// canvas on lg (a size container) and the viewport below it.
	const frameSize = $derived(`min(100%, calc((100cqh - 2rem) * ${width / height}))`);

	// the HTML templates, as the browser lays them out: a sandboxed (no scripts) iframe
	// sized to the OG canvas; the body is a flex box so the template's 100% × 100% root fills
	// it, and border-box matches what satori and takumi assume
	const srcdoc = $derived(
		`<!doctype html><style>*{box-sizing:border-box}html,body{margin:0;width:${width}px;height:${height}px;display:flex;overflow:hidden}</style>${html}`
	);

	const optionLines = $derived([
		`engine: '${engine}'`,
		`format: '${format}'`,
		`width: ${width}`,
		`height: ${height}`,
		...(showQuality ? [`quality: ${quality}`] : [])
	]);
	// one-line form of the call for the drawer's collapsed state
	const callLine = $derived(
		`createImage(${isComponent ? 'Card' : 'html'}, { ${optionLines.join(', ')} }${isComponent ? ', props' : ''})`
	);

	const snippet = $derived.by(() => {
		const opts = optionLines.join(',\n  ');
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
		'h-9 min-w-0 rounded-lg border border-border bg-background px-2.5 text-sm text-foreground dark:bg-muted hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-55';
	const segment =
		'h-7 rounded-md px-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';
	const tab =
		'h-9 flex-1 border-b-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring';
	// children truncate instead of wrapping when a pane is dragged narrow
	const paneHead =
		'flex h-9 shrink-0 items-center justify-between gap-3 border-b border-border px-4 text-xs text-muted-foreground [&>span]:min-w-0 [&>span]:truncate';
	// grows to fill its pane on lg; below lg the shell is as tall as its frame
	const canvas = 'flex min-h-0 flex-col items-center justify-center bg-muted/40 p-4 sm:p-6 lg:flex-1 lg:[container-type:size]';
	// hairline that grows a hit area on hover/drag; paneforge sets data-active while dragging
	const resizer =
		'group/r relative shrink-0 bg-border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring data-[active]:bg-brand hover:bg-foreground/40';
	const thumbCard =
		'group flex min-w-0 flex-col overflow-hidden rounded-xl border text-left transition-colors duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';
</script>

{#snippet segmented(name: string, value: string, options: readonly string[], set: (v: string) => void)}
	<div
		class="flex h-9 shrink-0 items-center gap-0.5 rounded-lg border border-border bg-background p-0.5 dark:bg-muted"
		role="radiogroup"
		aria-label={name}
	>
		{#each options as o (o)}
			<button
				type="button"
				role="radio"
				aria-checked={value === o}
				class="{segment} {value === o ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}"
				onclick={() => set(o)}
			>
				{o}
			</button>
		{/each}
	</div>
{/snippet}

<!-- the editor: HTML, or the component's props over its read-only markup -->
{#snippet editorPane()}
	<section class="flex h-full min-h-0 min-w-0 flex-col" aria-label={isComponent ? 'Props' : 'HTML'}>
		<div class={paneHead}>
			{#if isComponent}
				<span>Props · Card.svelte</span>
				<span>markup below is read-only</span>
			{:else}
				<span>HTML · live</span>
				<span>inline styles only · <kbd class="font-mono">⌘↩</kbd> renders now</span>
			{/if}
		</div>
		{#if isComponent}
			<div class="flex min-h-0 flex-1 flex-col overflow-auto">
				<div class="grid shrink-0 gap-3 border-b border-border p-4 sm:grid-cols-3">
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
				<div class="min-h-[14rem] flex-1">
					<HtmlEditor id="pg-card" value={cardMarkup} readonly fill />
				</div>
			</div>
		{:else}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="min-h-0 flex-1" {onkeydown}>
				<HtmlEditor id="pg-html" bind:value={html} fill />
			</div>
		{/if}
	</section>
{/snippet}

<!-- our render, in its own shell. The frame's width follows the shell height (cqh) and the
     aspect box sets its height, so it never crops as the panes are resized. -->
{#snippet engineShell()}
	<section class="flex min-h-0 min-w-0 flex-col lg:h-full" aria-label="Engine render">
		<div class={paneHead}>
			<span><span class="font-medium text-foreground">{engine}</span> · {format}</span>
			<span class="tabular-nums" aria-live="polite">
				{#if url && !error}
					{(bytes / 1024).toFixed(1)} KB · {ms} ms
				{:else if loading}
					Rendering…
				{/if}
			</span>
		</div>
		<div class={canvas}>
			<figure
				class="relative m-0 overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-opacity duration-150 ease-out motion-reduce:transition-none {loading && url ? 'opacity-60' : ''}"
				style:width={frameSize}
				style:aspect-ratio="{width} / {height}"
			>
				{#if error}
					<pre class="m-0 h-full overflow-auto whitespace-pre-wrap p-4 font-mono text-xs leading-relaxed text-destructive">{error}</pre>
				{:else if url}
					<img src={url} alt="Rendered Open Graph preview" class="h-full w-full object-contain" />
				{:else}
					<div class="h-full w-full animate-pulse bg-muted" aria-hidden="true"></div>
				{/if}
			</figure>
		</div>
	</section>
{/snippet}

<!-- the same markup laid out by the browser, at full OG size and scaled to fit -->
{#snippet browserShell()}
	<section class="flex min-h-0 min-w-0 flex-col lg:h-full" aria-label="Browser render">
		<div class={paneHead}>
			<span><span class="font-medium text-foreground">browser</span> · same markup, no engine</span>
			<span class="tabular-nums">{width} × {height}</span>
		</div>
		<div class={canvas}>
			<figure
				class="relative m-0 overflow-hidden rounded-lg border border-border bg-background shadow-sm"
				style:width={frameSize}
				style:aspect-ratio="{width} / {height}"
				bind:clientWidth={frameWidth}
			>
				<div class="flex origin-top-left" style:width="{width}px" style:height="{height}px" style:transform="scale({frameWidth / width})">
					{#if isComponent}
						<Card {title} {subtitle} {tag} />
					{:else}
						<iframe sandbox="" {srcdoc} title="HTML as rendered by your browser" class="h-full w-full border-0"></iframe>
					{/if}
				</div>
			</figure>
		</div>
	</section>
{/snippet}

<!-- full-bleed inside DocsLayout's padded content area; one screen tall on lg -->
<div class="-mx-4 -my-8 flex min-w-0 flex-1 flex-col lg:-mr-8 lg:ml-0 lg:h-[calc(100dvh-4rem)] lg:min-h-[36rem]">
	<!-- toolbar -->
	<div class="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border bg-background-secondary px-4 py-2.5">
		<!-- controls scroll sideways on narrow screens instead of stacking four rows deep -->
		<div class="relative flex min-w-0 max-w-full items-center gap-3 overflow-x-auto pb-0.5 [scrollbar-width:none] lg:flex-1 lg:flex-wrap">
		<button
			type="button"
			popovertarget="pg-templates"
			class="{field} inline-flex shrink-0 items-center gap-2 pr-2 font-medium"
			aria-haspopup="dialog"
		>
			<span class="text-muted-foreground">Template</span>
			{example.label}
			<CaretDown class="size-3.5 text-muted-foreground" aria-hidden="true" />
		</button>

		{@render segmented('Engine', engine, ENGINES, (v) => setEngine(v as Engine))}
		{@render segmented('Format', format, formats, (v) => (format = v))}

		<div class="flex shrink-0 items-center gap-1.5">
			<Label for="pg-width" class="sr-only">Width</Label>
			<Input id="pg-width" type="number" min="1" inputmode="numeric" bind:value={width} class="h-9 w-[4.5rem] px-2 tabular-nums" />
			<span class="text-xs text-muted-foreground" aria-hidden="true">×</span>
			<Label for="pg-height" class="sr-only">Height</Label>
			<Input id="pg-height" type="number" min="1" inputmode="numeric" bind:value={height} class="h-9 w-[4.5rem] px-2 tabular-nums" />
		</div>

		{#if showQuality}
			<div class="flex shrink-0 items-center gap-2">
				<Label for="pg-quality" class="text-xs text-muted-foreground">
					Quality <span class="tabular-nums text-foreground">{quality}</span>
				</Label>
				<input
					id="pg-quality"
					type="range"
					min="1"
					max="100"
					bind:value={quality}
					class="h-9 w-24 accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
				/>
			</div>
		{/if}
		</div>

		<div class="ml-auto flex items-center gap-2">
			{#if dirty}
				<Button variant="subtle" size="sm" onclick={() => (html = example.html)}>
					<ArrowCounterClockwise class="size-4" aria-hidden="true" />
					Reset
				</Button>
			{/if}
			<Button variant="outline" size="sm" href={url && !error ? url : undefined} download={downloadName} disabled={!url || !!error}>
				<DownloadSimple class="size-4" aria-hidden="true" />
				Download
			</Button>
			<Button size="sm" onclick={copySnippet} aria-live="polite">
				{#if copied}
					<Check class="size-4" aria-hidden="true" />
					Copied
				{:else}
					<Copy class="size-4" aria-hidden="true" />
					Copy code
				{/if}
			</Button>
		</div>
	</div>

	<!-- template picker: native popover in the top layer, hung below the header -->
	<div
		id="pg-templates"
		popover="auto"
		bind:this={picker}
		class="fixed inset-auto top-[4.5rem] left-1/2 m-0 w-[min(100vw-2rem,52rem)] -translate-x-1/2 rounded-xl border border-border bg-background p-4 shadow-lg backdrop:bg-foreground/20"
		aria-label="Templates"
	>
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-3" role="group" aria-label="Templates">
			{#each examples as ex (ex.id)}
				<button
					type="button"
					class="{thumbCard} {ex.id === exampleId ? 'border-brand ring-2 ring-brand' : 'border-border hover:border-foreground/40'}"
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
		<p class="mt-3 text-sm text-muted-foreground">{example.hint}</p>
	</div>

	{#if lg.current}
		<!-- workspace: editor | (engine / browser), every divider draggable; layout persists -->
		<PaneGroup direction="horizontal" autoSaveId="playground" class="min-h-0 flex-1">
			<Pane defaultSize={50} minSize={25}>
				{@render editorPane()}
			</Pane>
			<PaneResizer class="{resizer} w-px after:absolute after:inset-y-0 after:-left-1 after:w-2" aria-label="Resize editor" />
			<Pane defaultSize={50} minSize={25}>
				<PaneGroup direction="vertical" autoSaveId="playground-preview" class="h-full">
					<Pane defaultSize={50} minSize={15} collapsible>
						{@render engineShell()}
					</Pane>
					<PaneResizer class="{resizer} h-px after:absolute after:inset-x-0 after:-top-1 after:h-2" aria-label="Resize preview" />
					<Pane defaultSize={50} minSize={15} collapsible>
						{@render browserShell()}
					</Pane>
				</PaneGroup>
			</Pane>
		</PaneGroup>
	{:else}
		<div class="flex shrink-0 border-b border-border" role="tablist" aria-label="Playground panes">
			{#each tabs as [id, label] (id)}
				<button
					type="button"
					role="tab"
					aria-selected={view === id}
					class="{tab} {view === id ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}"
					onclick={() => (view = id)}
				>
					{label}
				</button>
			{/each}
		</div>
		{#if view === 'edit'}
			<div class="min-h-[24rem]">{@render editorPane()}</div>
		{:else if view === 'image'}
			{@render engineShell()}
		{:else if view === 'browser'}
			{@render browserShell()}
		{/if}
	{/if}

	<!-- code drawer: collapsed shows the call on one line; open shows the full snippet -->
	<details class="group {view === 'code' || lg.current ? 'block' : 'hidden'} shrink-0 border-t border-border bg-background" open={view === 'code' && !lg.current}>
		<summary
			class="flex h-10 cursor-pointer list-none items-center gap-3 px-4 text-xs text-muted-foreground hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&::-webkit-details-marker]:hidden"
		>
			<CaretDown class="size-3.5 shrink-0 transition-transform duration-150 group-open:rotate-180" aria-hidden="true" />
			<code class="min-w-0 truncate font-mono text-foreground">{callLine}</code>
			<code class="ml-auto hidden shrink-0 font-mono sm:block">{INSTALL}</code>
		</summary>
		<!-- {@html} is safe here: twinkleplop escapes its input, and the input is the snippet
		     string built above (user-typed props pass through JSON.stringify first). -->
		<div class="code max-h-[40vh] overflow-auto border-t border-border bg-muted/40">
			{@html snippetHtml}
			<p class="px-4 pb-4 font-mono text-xs text-muted-foreground sm:hidden">{INSTALL}</p>
		</div>
	</details>
</div>

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
