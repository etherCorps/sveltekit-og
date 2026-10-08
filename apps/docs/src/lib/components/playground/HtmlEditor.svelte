<!-- Colour-highlighted HTML editor: a transparent <textarea> laid over a twinkleplop-rendered
     <pre> with identical font metrics, scroll-synced. The textarea owns the text; the pre is
     paint only. Tab inserts two spaces. -->
<script lang="ts">
	import { language } from '@twinkleplop/html';

	let {
		value = $bindable(''),
		id,
		readonly = false,
		minHeight = '16rem'
	}: { value?: string; id: string; readonly?: boolean; minHeight?: string } = $props();

	const highlight = language();
	// a trailing newline would collapse in the pre and misalign the caret on the last line
	const painted = $derived(highlight(value.endsWith('\n') ? value + ' ' : value));

	let pre = $state<HTMLPreElement>();

	function sync(e: Event) {
		const ta = e.currentTarget as HTMLTextAreaElement;
		if (!pre) return;
		pre.scrollTop = ta.scrollTop;
		pre.scrollLeft = ta.scrollLeft;
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key !== 'Tab' || readonly) return;
		e.preventDefault();
		const ta = e.currentTarget as HTMLTextAreaElement;
		const { selectionStart: s, selectionEnd: en } = ta;
		value = value.slice(0, s) + '  ' + value.slice(en);
		requestAnimationFrame(() => ta.setSelectionRange(s + 2, s + 2));
	}
</script>

<div class="editor relative min-w-0 overflow-hidden rounded-xl border border-border bg-muted/40" style:min-height={minHeight}>
	<!-- {@html} is safe: twinkleplop HTML-escapes the source it highlights -->
	<pre bind:this={pre} class="paint" aria-hidden="true">{@html painted}</pre>
	<textarea
		{id}
		class="input"
		bind:value
		spellcheck={false}
		autocomplete="off"
		autocapitalize="off"
		wrap="off"
		{readonly}
		onscroll={sync}
		{onkeydown}
	></textarea>
</div>

<style>
	/* both layers share these metrics exactly, or the caret drifts from the paint */
	.paint,
	.input {
		margin: 0;
		padding: 1rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		line-height: 1.6;
		tab-size: 2;
		white-space: pre;
		overflow-wrap: normal;
	}
	.paint {
		min-height: inherit;
		overflow: hidden;
		pointer-events: none;
	}
	/* twinkleplop wraps its output in its own <pre>; flatten it into the paint layer */
	.paint :global(pre.twinkleplop) {
		margin: 0;
		padding: 0;
		background: transparent;
		font: inherit;
		line-height: inherit;
		white-space: inherit;
		overflow: visible; /* the paint layer scrolls, not the theme's own pre */
	}
	.input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		resize: none;
		border: 0;
		outline: 0;
		background: transparent;
		color: transparent;
		caret-color: var(--color-foreground);
		overflow: auto;
	}
	.input::selection {
		background: color-mix(in oklab, var(--color-brand) 25%, transparent);
	}
	.editor:focus-within {
		box-shadow: 0 0 0 2px var(--color-background), 0 0 0 4px var(--color-ring);
	}
	.input:read-only {
		cursor: default;
	}
</style>
