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

	const apiReference = `
import {ImageResponse, componentToImageResponse} from '@ethercorps/sveltekit-og'
import {SvelteComponent} from "svelte";

// ...
ImageResponse(
    element : string,
    options : {
      width ? : number = 1200
      height ? : number = 630,
      backgroundColor ? : string = "#fff"
      fonts ? : {
          name: string,
          data: ArrayBuffer,
          weight: number,
          style: 'normal' | 'italic'
      }[]
      debug ? : boolean = false
      graphemeImages ? : Record<string, string>;
      loadAdditionalAsset ? : (languageCode: string, segment: string) => Promise<SatoriOptions["fonts"] | string | undefined>;
      // Options that will be passed to the HTTP response
      status ? : number = 200
      statusText ? : string
      headers ? : Record<string, string>
    })

componentToImageResponse(
    component : typeof SvelteComponent,
    props : {}, // All export let example inside prop dictionary
    options : {
      width ? : number = 1200
      height ? : number = 630
      fonts ? : {
          name: string,
          data: ArrayBuffer,
          weight: number,
          style: 'normal' | 'italic'
      }[]
      debug ? : boolean = false
      graphemeImages ? : Record<string, string>;
      loadAdditionalAsset ? : (languageCode: string, segment: string) => Promise<SatoriOptions["fonts"] | string | undefined>;
      // Options that will be passed to the HTTP response
      status ? : number = 200
      statusText ? : string
      headers ? : Record<string, string>
    })

	`;
	const highlightedQuickEg = Prism.highlight(source, Prism.languages.svelte, 'svelte');
	const highlightedApiReference = Prism.highlight(apiReference, Prism.languages.svelte, 'svelte');

</script>

<div class="mx-10 mt-5 pb-10 space-y-5">
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
			Image Output: <a target="_blank" class="hover:text-indigo-500 transition-all" rel="noreferrer" href="https://sveltekit-og.ethercorps.io/new"> Live Version</a>
			<img loading="lazy" class="rounded-lg mt-5 shadow-lg shadow-indigo-200" src="https://sveltekit-og.ethercorps.io/new" alt="@ethercorps/sveltekit-og Demo OG Generated PNG" />
		</h2>
	</section>

	<section id="headers" class="space-y-3">
		<h1 class="font-bold text-2xl">Headers</h1>
		<p class="">
			Notice that our example uses TailwindCSS classes (e.g. <span class="bg-gray-100 px-2 py-1 rounded-full">tw="bg-gray-50"</span>). Alternatively, your HTML can contain style attributes using any of <a href="https://github.com/vercel/satori#css" target="_blank" rel="noreferrer" class="text-indigo-500">the subset of CSS supported by Satori</a>.
			<br />
			<br />
			Satori supports only a subset of HTML and CSS. For full details, see <a href="https://github.com/vercel/satori#documentation" target="_blank" rel="noreferrer" class="text-indigo-500">Satori’s documentation</a>. Notably, Satori only supports flex-based layouts.
		</p>
	</section>

	<section id="fonts" class="space-y-3">
		<h1 class="font-bold text-2xl">Fonts</h1>
		<p class="">
			Satori supports <span class="bg-gray-100 px-2 py-1 rounded-full">ttf</span>, <span class="bg-gray-100 px-2 py-1 rounded-full">otf</span>, and <span class="bg-gray-100 px-2 py-1 rounded-full">woff</span> font formats; <span class="bg-gray-100 px-2 py-1 rounded-full">woff2</span> is not supported. To maximize the font parsing speed, <span class="bg-gray-100 px-2 py-1 rounded-full">ttf</span> or <span class="bg-gray-100 px-2 py-1 rounded-full">otf</span> are recommended over <span class="bg-gray-100 px-2 py-1 rounded-full">woff</span>.
			<br />
			<br />
			By default, <span class="bg-gray-100 px-2 py-1 rounded-full">@ethercorps/sveltekit-og</span> includes only 'Noto Sans' font. If you need to use other fonts, you can specify them as shown in the example. Notably, you can also import a font file that is stored locally within your project and are not required to use fetch.
		</p>
	</section>

	<section id="examples" class="space-y-3">
		<h1 class="font-bold text-2xl">Examples</h1>

		<li><span class="bg-gray-100 px-2 py-1 rounded-full">ImageResponse</span> - <a href="https://github.com/etherCorps/sveltekit-og/blob/main/src/routes/new/+server.ts" target="_blank" rel="noreferrer" class="text-indigo-500">Source</a> - <a href="https://sveltekit-og-five.vercel.app/new" target="_blank" rel="noreferrer" class="text-indigo-500">Demo</a></li>
		<li><span class="bg-gray-100 px-2 py-1 rounded-full">componentToImageResponse</span> - <a href="https://github.com/etherCorps/sveltekit-og/tree/main/src/routes/component-og" target="_blank" rel="noreferrer" class="text-indigo-500">Source</a> - <a href="https://sveltekit-og-five.vercel.app/component-og" target="_blank" rel="noreferrer" class="text-indigo-500">Demo</a></li>
	</section>

	<section id="api-reference" class="space-y-3">
		<h1 class="font-bold text-2xl">Api Reference</h1>

		<p>
			The package exposes an <span class="bg-gray-100 px-2 py-1 rounded-full">ImageResponse</span> and <span class="bg-gray-100 px-2 py-1 rounded-full">componentToImageResponse</span> constructors, with the following options available.
		</p>
		<pre class="bg-gray-100 overflow-auto px-3 py-1.5 rounded-xl"><code class="" >{@html highlightedApiReference}</code></pre>
	</section>

	<div id="footer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 place-content-evenly">
		<section id="acknowledgements" class="space-y-3 bg-indigo-50 px-3 py-1.5 shadow-md w-full shadow-indigo-500 rounded-lg border border-indigo-500">
			<h1 class="font-bold text-2xl">Acknowledgements</h1>
			<p>This project will not be possible without the following projects:</p>

			<li><a href="https://github.com/vercel/satori" target="_blank" rel="noreferrer" class="text-indigo-500">Satori & Vercel-OG</a></li>
			<li><a href="https://fonts.google.com/noto" target="_blank" rel="noreferrer" class="text-indigo-500">Noto by Google Fonts</a></li>
			<li><a href="https://github.com/ssssota/svg2png-wasm" target="_blank" rel="noreferrer" class="text-indigo-500">svg2png-wasm</a></li>
		</section>
		<section id="author" class="space-y-3 bg-indigo-50 px-3 py-1.5 shadow-md w-full shadow-indigo-500 rounded-lg border border-indigo-500">
			<h1 class="font-bold text-2xl">Author</h1>
			<p>I would like to thank myself:</p>

			<li><a href="https://github.com/etherCorps" target="_blank" rel="noreferrer" class="text-indigo-500">@ethercorps</a></li>
			<li><a href="https://github.com/theetherGit" target="_blank" rel="noreferrer" class="text-indigo-500">@theetherGit</a></li>
		</section>
		<section id="contributors" class="space-y-3 bg-indigo-50 px-3 py-1.5 shadow-md w-full shadow-indigo-500 rounded-lg border border-indigo-500">
			<h1 class="font-bold text-2xl">Contributors</h1>
			<p>Without your commits, support, ideas and works every library is incomplete. So, special thanks to:</p>

			<li><a href="https://github.com/jasongitmail" target="_blank" rel="noreferrer" class="text-indigo-500">@jasongitmail</a></li>
		</section>
	</div>
</div>
