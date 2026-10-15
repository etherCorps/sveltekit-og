<!-- Demo component for the playground's "Svelte component" template. Inline styles only:
     the client entry captures the mounted component's innerHTML, so scoped <style> blocks
     would not reach the engines. -->
<script lang="ts">
	let {
		title = 'Open Graph, from a component',
		subtitle = 'Rendered in your browser',
		tag = 'sveltekit-og'
	}: { title?: string; subtitle?: string; tag?: string } = $props();
</script>

<div
	style="display:flex;flex-direction:column;justify-content:space-between;width:100%;height:100%;padding:72px 80px;background:#faf5ff;color:#2e1065;font-family:ui-sans-serif,system-ui,sans-serif"
>
	<div
		style="display:flex;align-self:flex-start;padding:8px 18px;border-radius:9999px;background:#7c3aed;color:#faf5ff;font-size:24px;font-weight:600"
	>
		{tag}
	</div>
	<div style="display:flex;flex-direction:column;gap:18px">
		<div style="display:flex;font-size:66px;font-weight:700;line-height:1.08;letter-spacing:-0.02em">{title}</div>
		<div style="display:flex;font-size:30px;line-height:1.4;color:#5b21b6">{subtitle}</div>
	</div>
	<div style="display:flex;font-size:24px;color:#7c3aed">Card.svelte · props editable on the left</div>
</div>
