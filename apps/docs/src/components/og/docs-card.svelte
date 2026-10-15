<script lang="ts">
	// Per-page OG card for the docs, styled with Tailwind utilities. Both engines map
	// classes (Takumi natively, Satori through its tw subset), so: flex everywhere a box
	// has children, arbitrary values for the exact sizes, 8-digit hex for alpha. The
	// gradient backgrounds and the mono font family stay inline — Satori's subset has no
	// gradient utilities, drops `gap-*` (margins instead) and doesn't map font-['Geist_Mono'].
	import LogoIcon from "./logo-icon.svelte";

	type Props = { title: string; description: string; section: string };
	const { title, description, section }: Props = $props();

	const titleSize = title.length > 36 ? "text-[56px]" : title.length > 22 ? "text-[68px]" : "text-[80px]";
	const descSize = description.length > 110 ? "text-[26px]" : "text-[30px]";
</script>

<div
	class="flex h-full w-full flex-col px-[72px] pt-[64px] font-[Geist] text-[#f5f5f7]"
	style="background:linear-gradient(135deg,#15151d 0%,#0b0b10 60%,#0b0b10 100%)"
>
	<!-- rose glow, top right -->
	<div
		class="absolute -right-[160px] -top-[220px] flex h-[620px] w-[620px] rounded-full"
		style="background:radial-gradient(circle,#e11d486b 0%,#e11d481f 45%,#e11d4800 70%)"
	></div>

	<!-- header: logo + wordmark -->
	<div class="flex items-center">
		<LogoIcon size={44} width={44} startColor="#FC7421" endColor="#FEBC5A" />
		<div class="ml-4 flex items-baseline">
			<span class="text-[30px] font-semibold tracking-[-0.01em]">SvelteKit OG</span>
			<span class="ml-[10px] text-[24px] text-[#8b8b95]">docs</span>
		</div>
	</div>

	<!-- body -->
	<div class="flex flex-grow flex-col justify-center pb-10">
		<span class="mb-[22px] text-[22px] uppercase tracking-[0.12em] text-[#fb7185]" style="font-family:'Geist Mono'">
			{section}
		</span>
		<div class="flex max-w-[980px] {titleSize} font-semibold leading-[1.08] tracking-[-0.03em]" style="text-wrap:balance">
			{title}
		</div>
		{#if description}
			<div class="mt-[26px] flex max-w-[900px] {descSize} leading-[1.4] text-[#a1a1aa]" style="text-wrap:balance">
				{description}
			</div>
		{/if}
	</div>

	<!-- footer -->
	<div class="flex items-center justify-between pb-[34px] text-[22px] text-[#8b8b95]" style="font-family:'Geist Mono'">
		<span>sveltekit-og.dev</span>
		<span class="flex items-center rounded-full border border-[#fb718573] bg-[#e11d4824] px-[18px] py-2 text-[#fecdd3]">v5</span>
	</div>

	<!-- brand bar -->
	<div
		class="absolute bottom-0 left-0 right-0 flex h-[10px]"
		style="background:linear-gradient(90deg,#e11d48 0%,#fc7421 60%,#febc5a 100%)"
	></div>
</div>
