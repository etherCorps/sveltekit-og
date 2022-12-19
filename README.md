# Open Graph Image Generation

About
Generate Open Graph Images dynamically from HTML/CSS without a browser in SvelteKit.

## v1.0.0 Update (Breaking Changes)

Finally, We have added html to react like element like object converter out of the box and with svelte compiler.
Now you can use `{ toReactElement }` with `"@ethercorps/sveltekit-og"` like:

```typescript
// +page.server.js

import { toReactElement, satori } from '@ethercorps/sveltekit-og';

const htmlString = `
        <div tw="bg-gray-50 flex w-full">
        <div tw="flex flex-col md:flex-row w-full py-12 px-4 md:items-center justify-between p-8">
          <h2 tw="flex flex-col text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 text-left">
            <span>Ready to dive in?</span>
            <span tw="text-indigo-600">Start your free trial today.</span>
          </h2>
          <div tw="mt-8 flex md:mt-0">
            <div tw="flex rounded-md shadow">
              <a tw="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-3 text-base font-medium text-white">Get started</a>
            </div>
            <div tw="ml-3 flex rounded-md shadow">
              <a tw="flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-indigo-600">Learn more</a>
            </div>
          </div>
        </div>
        </div>
        `;
const newNode = toReactElement(htmlString);

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const fontFile400 = await fetch(
		'https://og-playground.vercel.app/inter-latin-ext-400-normal.woff'
	);
	const fontData400 = await fontFile400.arrayBuffer();
	const svg = await satori(newNode, {
		height: 350,
		width: 500,
		fonts: [
			{
				name: 'sans serif',
				data: fontData400,
				style: 'normal',
				weight: 700
			}
		]
	});

	return { svg };
}
```

- We have changed to function based instead of class based ImageResponse and componentToImageResponse.
- Removed `@resvg/resvg-wasm` with `@resvg/resvg-js` because of internal errors.
- Removed `satori-html` because now we have `toReactElement` out of the box with svelte compiler.
  > If you find a problem related to undefined a please check [_vite.config.js_](/vite.config.ts) and add ` define: { _a: 'undefined' } in config.`

> If you find any issue and have suggestion for this project please open a ticket and if you want to contribute please create a new discussion.

## Quick Start

Install `@ethercorps/sveltekit-og`, then use it inside a server endpoint route (+server.ts or +server.js):

```typescript
// /routes/og/+server.ts
import { ImageResponse } from '@ethercorps/sveltekit-og';
import { RequestHandler } from './$types';

const template = `
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
`;
const fontFile = await fetch('https://og-playground.vercel.app/inter-latin-ext-400-normal.woff');
const fontData: ArrayBuffer = await fontFile.arrayBuffer();

export const GET: RequestHandler = async () => {
	return await ImageResponse(template, {
		height: 250,
		width: 500,
		fonts: [
			{
				name: 'Inter Latin',
				data: fontData,
				weight: 400
			}
		]
	});
};
```

Then run `pnpm dev` and access localhost:5173/og, the api/route endpoint be rendered and responded as a PNG from that api/endpoint:

![Rendered OG image](static/demo.png)

Read more about the API, supported features and check out the examples on Satori Playground.

## Examples:

- `ImageResponse` · [_source_](/src/routes/new/+server.ts) · [_demo_](https://sveltekit-og-five.vercel.app/new)
- `componentToImageResponse` · [_source_](/src/routes/component-og/) · [_demo_](https://sveltekit-og-five.vercel.app/component-og)

## API Reference

The package exposes an `ImageResponse` and `componentToImageResponse` constructors, with the following options available:

```typescript
import {ImageResponse, componentToImageResponse} from '@ethercorps/sveltekit-og'
import {SvelteComponent} from "svelte";

// ...
ImageResponse(
    element : string,
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
```

When running in production, these headers will be included by `@ethercorps/sveltekit-og`:

```typescript
'content-type': 'image/png',
'cache-control': 'public, immutable, no-transform, max-age=31536000',
```

During development, the `cache-control: no-cache, no-store` header is used instead.

### Supported HTML and CSS Features

Please refer to [Satori’s documentation](https://github.com/vercel/satori#documentation) for a list of supported HTML and CSS features.

By default, `@ethercorps/sveltekit-og` only has the 'Noto Sans' font included. If you need to use other fonts, you can pass them in the `fonts` option.

## Acknowledgements

This project will not be possible without the following projects:

- [Satori & @vercel/og](https://github.com/vercel/satori)
- [Noto by Google Fonts](https://fonts.google.com/noto)
- [Resvg.js](https://github.com/yisibl/resvg-js)

## Authors

- [@theetherGit](https://www.github.com/theetherGit)
- [@etherCorps](https://www.github.com/etherCorps)
