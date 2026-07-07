<!-- Shared component for every `/cog` route. `css="injected"` inlines these
     scoped styles into the SSR output so both engines can read them — a demo
     of the `<style>` tag approach (no `tw`, no inline styles). -->
<svelte:options css="injected" />

<script lang="ts">
	import type { TemplateData } from './templates';
	let { provider, format, mode, timestamp }: TemplateData = $props();
</script>

<div class="wrap">
	<div class="card">
		<div class="eyebrow">Svelte Component</div>
		<div class="title">Open Graph Images</div>
		<div class="badges">
			<span class="badge accent">{provider}</span>
			<span class="badge">{format}</span>
			<span class="badge">{mode}</span>
		</div>
		<div class="stamp">{timestamp}</div>
	</div>
</div>

<style>
	.wrap {
		display: flex;
		height: 100%;
		width: 100%;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #111827;
	}
	.card {
		display: flex;
		flex-direction: column;
		align-items: center;
		border-radius: 24px;
		background: #1f2937;
		padding: 56px 80px;
	}
	.eyebrow {
		font-size: 30px;
		font-weight: 600;
		color: #818cf8;
	}
	.title {
		font-size: 72px;
		font-weight: 700;
		color: #ffffff;
		margin-top: 12px;
	}
	.badges {
		display: flex;
		align-items: center;
		margin-top: 32px;
	}
	.badge {
		display: flex;
		border-radius: 9999px;
		background: #374151;
		padding: 8px 20px;
		font-size: 24px;
		font-weight: 500;
		color: #e5e7eb;
		margin-left: 12px;
	}
	.accent {
		background: #4f46e5;
		color: #ffffff;
		margin-left: 0;
	}
	.stamp {
		font-size: 20px;
		color: #9ca3af;
		margin-top: 24px;
	}
</style>
