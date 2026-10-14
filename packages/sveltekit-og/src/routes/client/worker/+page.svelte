<script lang="ts">
	import { onMount } from "svelte";

	let worker: Worker;
	let url = $state<string | null>(null);
	let error = $state<string | null>(null);
	let busy = $state(false);
	let nextId = 0;

	onMount(() => {
		worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
		return () => worker.terminate();
	});

	function run(engine: "takumi" | "satori", kind: "html" | "component") {
		busy = true;
		error = null;
		const id = ++nextId;
		worker.onmessage = (e: MessageEvent) => {
			if (e.data.id !== id) return;
			busy = false;
			if (e.data.ok) {
				if (url) URL.revokeObjectURL(url);
				url = URL.createObjectURL(new Blob([e.data.bytes], { type: "image/png" }));
			} else {
				error = `${e.data.code}: ${e.data.message}`;
			}
		};
		worker.postMessage({ id, engine, kind });
	}
</script>

<h1>Worker demo (dev only)</h1>
<p>Renders happen inside a module worker. Components must fail with <code>COMPONENT_IN_WORKER</code>.</p>

<div style="display:flex;gap:8px;flex-wrap:wrap;margin:16px 0">
	<button disabled={busy} onclick={() => run("takumi", "html")}>takumi · html</button>
	<button disabled={busy} onclick={() => run("satori", "html")}>satori · html</button>
	<button disabled={busy} onclick={() => run("takumi", "component")}>takumi · component (expect error)</button>
	<button disabled={busy} onclick={() => run("satori", "component")}>satori · component (expect error)</button>
</div>

{#if error}<pre data-testid="error" style="color:#b91c1c">{error}</pre>{/if}
{#if url}<img src={url} alt="worker output" width="800" height="400" style="max-width:100%" />{/if}
