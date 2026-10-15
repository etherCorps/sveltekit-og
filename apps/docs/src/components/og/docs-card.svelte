<script lang="ts">
	// Per-page OG card for the docs. Inline styles and real CSS only: Takumi parses the
	// style attribute strictly, and Satori needs display:flex on every box with children.
	import LogoIcon from "./logo-icon.svelte";

	type Props = { title: string; description: string; section: string };
	const { title, description, section }: Props = $props();

	const titleSize = title.length > 36 ? 56 : title.length > 22 ? 68 : 80;
	const descSize = description.length > 110 ? 26 : 30;
</script>

<div
	style="display:flex;flex-direction:column;width:100%;height:100%;padding:64px 72px 0 72px;background:linear-gradient(135deg,#15151d 0%,#0b0b10 60%,#0b0b10 100%);color:#f5f5f7;font-family:Geist"
>
	<!-- rose glow, top right -->
	<div
		style="display:flex;position:absolute;top:-220px;right:-160px;width:620px;height:620px;border-radius:9999px;background:radial-gradient(circle,rgba(225,29,72,0.42) 0%,rgba(225,29,72,0.12) 45%,rgba(225,29,72,0) 70%)"
	></div>

	<!-- header: logo + wordmark -->
	<div style="display:flex;align-items:center;gap:16px">
		<LogoIcon size={44} width={44} startColor="#FC7421" endColor="#FEBC5A" />
		<div style="display:flex;align-items:baseline;gap:10px">
			<span style="font-size:30px;font-weight:600;letter-spacing:-0.01em">SvelteKit OG</span>
			<span style="font-size:24px;color:#8b8b95">docs</span>
		</div>
	</div>

	<!-- body -->
	<div style="display:flex;flex-direction:column;justify-content:center;flex-grow:1;padding-bottom:40px">
		<span
			style="font-family:'Geist Mono';font-size:22px;font-weight:400;letter-spacing:0.12em;color:#fb7185;text-transform:uppercase;margin-bottom:22px"
		>
			{section}
		</span>
		<div
			style="display:flex;font-size:{titleSize}px;font-weight:600;line-height:1.08;letter-spacing:-0.03em;max-width:980px;text-wrap:balance"
		>
			{title}
		</div>
		{#if description}
			<div
				style="display:flex;margin-top:26px;font-size:{descSize}px;line-height:1.4;color:#a1a1aa;max-width:900px;text-wrap:balance"
			>
				{description}
			</div>
		{/if}
	</div>

	<!-- footer -->
	<div
		style="display:flex;align-items:center;justify-content:space-between;padding:0 0 34px 0;font-family:'Geist Mono';font-size:22px;color:#8b8b95"
	>
		<span>sveltekit-og.dev</span>
		<span
			style="display:flex;align-items:center;padding:8px 18px;border-radius:9999px;border:1px solid rgba(251,113,133,0.45);background:rgba(225,29,72,0.14);color:#fecdd3"
		>
			v5
		</span>
	</div>

	<!-- brand bar -->
	<div
		style="display:flex;position:absolute;left:0;right:0;bottom:0;height:10px;background:linear-gradient(90deg,#e11d48 0%,#fc7421 60%,#febc5a 100%)"
	></div>
</div>
