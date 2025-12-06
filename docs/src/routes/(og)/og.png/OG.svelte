<svelte:options css="injected" />

<script lang="ts">
	import SvelteLogo from '../(assets)/svelte-logo.svg?raw';
	import Logo from './logo-icon.svelte';
</script>

<div class="flex flex-col bg-gradient w-full h-full p-5">
	<div class="flex flex-row justify-normal items-center">
		<Logo class="w-5 h-5" startColor="#4f46e5" endColor="#a5b4fc" />
		<span class="ml-2 font-semibold text-xl text-orange-100">@ethercorps/sveltekit-og</span>
	</div>
	<div class="flex flex-row items-center justify-between w-full h-[90%] px-10">
		<div class="flex flex-col justify-center h-full w-1/2">
			<p class="text-lg -mb-3 text-indigo-100 font-bold tracking-wider">SVELTEKIT OG</p>
			<p class="text-5xl font-bold text-indigo-200 tracking-widest">VERSION 4 ✨</p>
			<p class="-mt-2 text-lg text-indigo-300 opacity-65">
				Sveltekit OG v4 with support for Node, Deno, Cloudflare Workers, Pages, Vercel and Netlify
			</p>
		</div>
		<div class="flex flex-row items-center justify-center w-1/2">
			{@html SvelteLogo}
		</div>
	</div>
	<div class="flex flex-row text-gray-50">sveltekit-og.dev</div>
</div>

<style>
	.bg-gradient {
		background: linear-gradient(
			to right,
			#3730a3,
			#4f46e5,
			#4f46e5
		); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
	}
</style>
