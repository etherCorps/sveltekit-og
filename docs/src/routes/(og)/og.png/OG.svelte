<svelte:options css="injected" />
<script lang="ts">
	import Logo from "../(assets)/ethercorps-logo.png?inline"
	import SvelteLogo from "../(assets)/svelte-logo.svg?raw"
</script>

<div class="flex flex-col bg-gradient w-full h-full p-5">
	<div class="flex flex-row justify-normal items-center">
		<img src={Logo} class="w-8" />
		<span class="ml-2 font-semibold text-xl text-gray-100">@ethercorps/sveltekit-og</span>
	</div>
	<div class="flex flex-row items-center justify-between w-full h-[90%] px-10">
		<div class="flex flex-col justify-center h-full w-1/2">
			<p class="text-lg -mb-3 text-teal-200 font-bold tracking-wider">SVELTEKIT OG</p>
			<p class="text-5xl font-bold text-teal-400 tracking-widest">VERSION 4 ✨</p>
			<p class="-mt-2 text-lg text-gray-300">Sveltekit OG v4 with support for Node, Deno, Cloudflare Workers, Pages, Vercel and Netlify</p>
		</div>
		<div class="flex flex-row items-center justify-center w-1/2">
			{@html SvelteLogo}
		</div>
	</div>
	<div class="flex flex-row text-gray-400">sveltekit-og.dev</div>
</div>

<style>
	.bg-gradient {
      background: linear-gradient(to right, #2C5364, #203A43, #0F2027); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
	}
</style>