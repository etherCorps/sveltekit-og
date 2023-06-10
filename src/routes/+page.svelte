<script>
	import {base} from "$app/paths";
	import Prism from 'prismjs';
	import 'prism-svelte';
	import 'prismjs/themes/prism-tomorrow.css';
	const source = `
/src/routes/new/+server.ts

import { ImageResponse } from '@ethercorps/sveltekit-og';
import type { RequestHandler } from '@sveltejs/kit';

const template = \`
 <div tw="bg-gray-50 flex w-full h-full items-center justify-center">
    <div tw="flex flex-col md:flex-row w-full py-12 px-4 md:items-center justify-between p-8">
      <h2 tw="flex flex-col text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 text-left">
        <span>Ready to dive in?</span>
        <span tw="text-indigo-600">Start your free trial today.</span>
      </h2>
      <div tw="mt-8 flex md:mt-0">
        <div tw="flex rounded-md shadow">
          <a href="#" tw="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-3 text-base font-medium text-white">Get started</a>
        </div>
        <div tw="ml-3 flex rounded-md shadow">
          <a href="#" tw="flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-indigo-600">Learn more</a>
        </div>
      </div>
    </div>
  </div>
\`;

const fontFile400 = await fetch(
	'https://raw.githubusercontent.com/etherCorps/sveltekit-og/main/static/inter-latin-ext-400-normal.woff'
);

const fontFile700 = await fetch(
	'https://raw.githubusercontent.com/etherCorps/sveltekit-og/main/static/inter-latin-ext-700-normal.woff'
);

const fontData400: ArrayBuffer = await fontFile400.arrayBuffer();
const fontData700: ArrayBuffer = await fontFile700.arrayBuffer();

export const GET: RequestHandler = async () => {
  return await ImageResponse(template, {
				height: 250,
				width: 500,
				fonts: [
						{
							name: 'Inter Latin',
							data: fontData400,
							weight: 400
						},
						{
							name: 'Inter Latin',
							data: fontData700,
							weight: 700
						}
				]
		});
};

`;
	const highlightedQuickEg = Prism.highlight(source, Prism.languages.svelte, 'svelte');

</script>

<div class="mx-10 mt-5 space-y-5">
	<section id="introduction" class="space-y-3">
		<h1 class="font-bold text-2xl">Introduction</h1>
		<p class="">
			SvelteKit-OG is use to dynamically generate Open Graph images from an HTML+CSS template or
			Svelte component using fast and efficient conversion from <br /> HTML > SVG > PNG. Based on Satori.
			No headless browser required.
		</p>
	</section>

	<section id="installation" class="space-y-4">
		<h1 class="font-bold text-2xl">Installation</h1>
		<p>
			Use your favourite package manager and add <span class="bg-gray-100 px-2 py-1 rounded-full"
				>@ethercorps/sveltekit-og</span
			>
			as your <span class="bg-gray-100 px-2 py-1 rounded-full">devDependency</span>.
		</p>
		<div id="pnpm-install-og">
			Example:
			<code class="border rounded-full bg-gray-100 px-3 py-1.5 text-gray-900">
				pnpm i -D @ethercorps/sveltekit-og
			</code>
		</div>
		<div class="border-x-4 border-gray-900 rounded-lg leading-9">
			<p class="ml-2">
				If you are using it on with <span class="bg-gray-100 px-2 py-1 rounded-full">
					cloudflare pages
				</span>
				or <span class="bg-gray-100 px-2 py-1 rounded-full">cloudflare workers </span> then you have
				to provide <span class="bg-gray-100 px-2 py-1 rounded-full">polyfills</span> for
				<span class="bg-gray-100 px-2 py-1 rounded-full">url</span>. You can simply add it to your
				<span class="bg-gray-100 px-2 py-1 rounded-full">devDependency</span>,
				<br /> To install
				<code class="border rounded-full bg-gray-100 px-3 py-1.5 text-gray-900">
					pnpm i -D url
				</code>
			</p>
		</div>
	</section>
	<section id="usage" class="space-y-3">
		<h1 class="font-bold text-2xl">Usage</h1>
		<p class="">
			Create a file at <span class="bg-gray-100 px-2 py-1 rounded-full">
				/src/routes/og/+server.ts
			</span>. Alternatively, you can use JavaScript by removing the types from this example.
		</p>
		<div class="border-x-4 border-gray-900 rounded-lg w-fit px-2 leading-9">
			<p class="ml-2">
				Route can be anything but it should have only one file
				<span class="bg-gray-100 px-2 py-1 rounded-full"> +server.ts </span>
			</p>
		</div>
		<pre class="bg-gray-100 overflow-auto px-3 py-1.5 rounded-xl"><code class="" >{@html highlightedQuickEg}</code></pre>
		<div class="border-x-4 border-gray-900 rounded-lg w-fit px-2 leading-9">
			<p class="ml-2">
				Then run <span class="bg-gray-100 px-2 py-1 rounded-full"> pnpm run dev </span> and visit <span class="bg-gray-100 px-2 py-1 rounded-full"> localhost:5173/og </span> to view your generated PNG. Remember that hot module reloading does not work with server routes, so if you change your HTML or CSS, hard refresh the route to see changes.
			</p>
		</div>
		<h2 class="font-bold text-xl">
			Image Output: <a target="_blank" rel="noreferrer" href="https://sveltekit-og.ethercorps.io/new"> Live </a>
		</h2>
	</section>
</div>
