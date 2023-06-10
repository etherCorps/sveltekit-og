# SvelteKit Open Graph Image Generation

Dynamically generate Open Graph images from an HTML+CSS template or Svelte component using fast and efficient conversion from HTML > SVG > PNG. Based on [Satori](https://github.com/vercel/satori#documentation). No headless browser required.

## Installation

```bash
pnpm install -D @ethercorps/sveltekit-og
```

> Using with Cloudflare Pages or Workers then you have to provide `url` polyfill by just installing it as `devDependency`.

```bash
pnpm i -D url
```

## Usage

Create a file at `/src/routes/og/+server.ts`. Alternatively, you can use JavaScript by removing the types from this example.

```typescript
// src/routes/og/+server.ts
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
		height: 630,
		width: 1200,
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

Then run `npm dev` and visit `localhost:5173/og` to view your generated PNG. Remember that hot module reloading does not work with server routes, so if you change your HTML or CSS, hard refresh the route to see changes.

## Example Output

![Rendered OG image](static/demo.png)

## Headers

When run in development, image headers contain `cache-control: no-cache, no-store`. In production, image headers contain `'cache-control': 'public, immutable, no-transform, max-age=31536000'`, which caches the image for 1 year. In both cases, the `'content-type': 'image/png'` is used.

## Styling

Notice that our example uses TailwindCSS classes (e.g. `tw="bg-gray-50"`). Alternatively, your HTML can contain style attributes using any of [the subset of CSS supported by Satori](https://github.com/vercel/satori#css).

Satori supports only a subset of HTML and CSS. For full details, see [Satori’s documentation](https://github.com/vercel/satori#documentation). Notably, Satori only supports flex-based layouts.

## Fonts

Satori supports `ttf`, `otf`, and `woff` font formats; `woff2` is not supported. To maximize the font parsing speed, `ttf` or `otf` are recommended over `woff`.

By default, `@ethercorps/sveltekit-og` includes only 'Noto Sans' font. If you need to use other fonts, you can specify them as shown in the example. Notably, you can also import a font file that is stored locally within your project and are not required to use fetch.

## Examples

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
```

## Changelog

### v1.2.3 Update (Breaking Changes)

> Now you have to install dependency by yourself which will make it easier to build for all plateforms.

```
npm i @resvg/resvg-js
```

```
npm i satori
```

> From now on their will be no issues related to build, and soon this library going to have its own documentation.

### v1.2.2 Update (Breaking Change)

- We don't provide access to satori from `@ethercorps/sveltekit-og`.

### v1.0.0 Update (Breaking Changes)

Finally, We have added html to react like element like object converter out of the box and with svelte compiler.
Now you can use `{ toReactElement }` with `"@ethercorps/sveltekit-og"` like:

- We have changed to function based instead of class based ImageResponse and componentToImageResponse.
- Removed `@resvg/resvg-wasm` with `@resvg/resvg-js` because of internal errors.
- Removed `satori-html` because now we have `toReactElement` out of the box with svelte compiler.
  > If you find a problem related to undefined a please check [_vite.config.js_](/vite.config.ts) and add ` define: { _a: 'undefined' } in config.`

> If you find any issue and have suggestion for this project please open a ticket and if you want to contribute please create a new discussion.

## Acknowledgements

This project will not be possible without the following projects:

- [Satori & @vercel/og](https://github.com/vercel/satori)
- [Noto by Google Fonts](https://fonts.google.com/noto)
- [svg2png-wasm](https://github.com/ssssota/svg2png-wasm)

## Authors

- [@theetherGit](https://www.github.com/theetherGit)
- [@etherCorps](https://www.github.com/etherCorps)

## Contributors

- [@jasongitmail](https://github.com/jasongitmail)
