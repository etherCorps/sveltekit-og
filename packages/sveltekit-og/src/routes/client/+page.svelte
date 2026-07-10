<script lang="ts">
	import { createImage, type ClientImageResponseOptions } from "$lib/client/index.js";
	import Card from "./Card.svelte";

	type Engine = "takumi" | "satori";
	type InputType = "html" | "component";

	// takumi encodes more raster formats than satori; only preview-able ones are listed
	const FORMATS: Record<Engine, string[]> = {
		takumi: ["png", "jpeg", "webp", "svg"],
		satori: ["png", "svg"],
	};

	const SAMPLE_HTML = `<div style="display:flex;width:100%;height:100%;align-items:center;justify-content:center;background:linear-gradient(135deg,#6366f1,#a855f7);font-family:sans-serif">
  <div style="color:white;font-size:56px;font-weight:700;text-align:center;padding:40px">Rendered in your browser</div>
</div>`;

	let engine = $state<Engine>("takumi");
	let inputType = $state<InputType>("html");
	let html = $state(SAMPLE_HTML);
	let title = $state("sveltekit-og");
	let subtitle = $state("client-side rendering");
	let num1 = $state(2);
	let num2 = $state(2);
	let format = $state("png");
	let width = $state(1200);
	let height = $state(630);
	let quality = $state(90);

	let url = $state<string | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let bytes = $state(0);
	let ms = $state(0);

	const formats = $derived(FORMATS[engine]);
	const showQuality = $derived(engine === "takumi" && (format === "jpeg" || format === "webp"));

	// keep format valid when the engine (and its format list) changes
	function onEngineChange() {
		if (!FORMATS[engine].includes(format)) format = "png";
	}

	// current object URL, kept across renders so we only revoke the old one once its
	// replacement is ready (revoking in the effect cleanup would blank the visible image)
	let objectUrl: string | null = null;

	$effect(() => {
		// read every reactive dep synchronously so the effect re-runs on any change
		const isComponent = inputType === "component";
		const element = isComponent ? Card : html;
		const props = isComponent ? { title, subtitle, num1, num2 } : undefined;
		const opts = {
			engine,
			format,
			width,
			height,
			...(showQuality ? { quality } : {}),
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
				error = e instanceof Error ? e.message : String(e);
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

	const downloadName = $derived(`og.${format === "svg" ? "svg" : format}`);
</script>

<div class="page">
	<header>
		<h1>Client Playground</h1>
		<p>Images generated in your browser — no server request. Pick an engine, format and input.</p>
	</header>

	<div class="split">
		<!-- Controls + editor -->
		<section class="panel">
			<div class="controls">
				<label>
					<span>Engine</span>
					<select bind:value={engine} onchange={onEngineChange}>
						<option value="takumi">takumi</option>
						<option value="satori">satori</option>
					</select>
				</label>

				<label>
					<span>Format</span>
					<select bind:value={format}>
						{#each formats as f (f)}
							<option value={f}>{f}</option>
						{/each}
					</select>
				</label>

				<label>
					<span>Width</span>
					<input type="number" min="1" bind:value={width} />
				</label>

				<label>
					<span>Height</span>
					<input type="number" min="1" bind:value={height} />
				</label>

				{#if showQuality}
					<label class="wide">
						<span>Quality ({quality})</span>
						<input type="range" min="1" max="100" bind:value={quality} />
					</label>
				{/if}
			</div>

			<div class="tabs">
				<button class:active={inputType === "html"} onclick={() => (inputType = "html")}>
					HTML
				</button>
				<button class:active={inputType === "component"} onclick={() => (inputType = "component")}>
					Svelte component
				</button>
			</div>

			{#if inputType === "html"}
				<textarea bind:value={html} spellcheck="false"></textarea>
			{:else}
				<div class="component-inputs">
					<p class="hint">Rendering <code>Card.svelte</code> with props:</p>
					<label>
						<span>title</span>
						<input bind:value={title} />
					</label>
					<label>
						<span>subtitle</span>
						<input bind:value={subtitle} />
					</label>
					<label>
						<span>Number 1</span>
						<input type="number" bind:value={num1} />
					</label>
					<label>
						<span>Number 2</span>
						<input type="number" bind:value={num2} />
					</label>
				</div>
			{/if}
		</section>

		<!-- Preview -->
		<section class="panel preview">
			<div class="preview-head">
				<span>Preview</span>
				{#if url && !error}
					<div class="meta">
						<span>{(bytes / 1024).toFixed(1)} KB · {ms} ms</span>
						<a href={url} download={downloadName}>Download</a>
					</div>
				{/if}
			</div>

			<div class="stage" class:busy={loading}>
				{#if error}
					<pre class="error">{error}</pre>
				{:else if url}
					<img src={url} alt="Generated OG" />
				{:else}
					<span class="placeholder">Rendering…</span>
				{/if}
			</div>
		</section>
	</div>
</div>

<style>
	.page {
		font-family:
			ui-sans-serif,
			system-ui,
			-apple-system,
			sans-serif;
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1.25rem 3rem;
		color: #1f2937;
	}
	header h1 {
		margin: 0 0 0.25rem;
		font-size: 1.6rem;
	}
	header p {
		margin: 0;
		color: #6b7280;
	}
	.split {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.25rem;
		margin-top: 1.5rem;
	}
	@media (max-width: 820px) {
		.split {
			grid-template-columns: 1fr;
		}
	}
	.panel {
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		background: #fff;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}
	.controls {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		font-size: 0.82rem;
		color: #374151;
	}
	label.wide {
		grid-column: 1 / -1;
	}
	select,
	input,
	textarea {
		font: inherit;
		padding: 0.45rem 0.55rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		background: #fff;
	}
	input[type="range"] {
		padding: 0;
	}
	.tabs {
		display: flex;
		gap: 0.4rem;
	}
	.tabs button {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		background: #f9fafb;
		cursor: pointer;
		font: inherit;
	}
	.tabs button.active {
		background: #6366f1;
		border-color: #6366f1;
		color: #fff;
	}
	textarea {
		min-height: 260px;
		resize: vertical;
		font-family: ui-monospace, "SF Mono", Menlo, monospace;
		font-size: 0.8rem;
		line-height: 1.5;
	}
	.component-inputs {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.hint {
		margin: 0;
		font-size: 0.82rem;
		color: #6b7280;
	}
	code {
		background: #f3f4f6;
		padding: 0.05rem 0.3rem;
		border-radius: 4px;
	}
	.preview-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.85rem;
		color: #374151;
	}
	.meta {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		color: #6b7280;
	}
	.meta a {
		color: #6366f1;
		font-weight: 600;
		text-decoration: none;
	}
	.stage {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 240px;
		border-radius: 8px;
		background:
			repeating-conic-gradient(#f3f4f6 0% 25%, #fff 0% 50%) 50% / 20px 20px;
		padding: 0.75rem;
		transition: opacity 0.15s;
	}
	.stage.busy {
		opacity: 0.55;
	}
	.stage img {
		max-width: 100%;
		max-height: 60vh;
		height: auto;
		border-radius: 6px;
		box-shadow: 0 1px 6px rgba(0, 0, 0, 0.15);
	}
	.placeholder {
		color: #9ca3af;
	}
	.error {
		color: #b91c1c;
		white-space: pre-wrap;
		font-size: 0.8rem;
		margin: 0;
		padding: 0.75rem;
	}
</style>
