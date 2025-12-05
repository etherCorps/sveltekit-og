[![npm version](https://flat.badgen.net/npm/v/@ethercorps/sveltekit-og?color=orange)](https://npmjs.com/package/bits-ui)
[![npm downloads](https://flat.badgen.net/npm/dm/@ethercorps/sveltekit-og?color=orange)](https://npmjs.com/package/@ethercorps/sveltekit-og)
[![license](https://flat.badgen.net/github/license/ethercorps/sveltekit-og?color=orange)](https://github.com/ethercorps/sveltekit-og/blob/main/LICENSE)

# SvelteKit Open Graph Image Generation

Dynamically generate Open Graph images from an HTML+CSS template or Svelte component using fast and efficient conversion from HTML > SVG > PNG. Based on [Satori](https://github.com/vercel/satori#documentation). No headless browser required.

## Table of Contents

- [SvelteKit Open Graph Image Generation](#sveltekit-open-graph-image-generation)
  - [Table of Contents](#table-of-contents)
  - [Docs](#docs)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API Reference](#api-reference)
  - [Features](#features)
    - [Styling](#styling)
    - [Fonts](#fonts)
    - [Headers](#headers)
  - [Examples](#examples)
  - [Contributing](#contributing)
  - [Changelog](#changelog)
  - [License](#license)
  - [Acknowledgements](#acknowledgements)
  - [Authors](#authors)
  - [Contributors](#contributors)

## Docs

For more detailed information and advanced usage, please refer to the [official documentation](https://sveltekit-og.dev).

## Installation

```bash
pnpm install @ethercorps/sveltekit-og
```

## Usage

1.  **Add the Vite plugin**

    ```typescript title="vite.config.js"
    import { sveltekit } from '@sveltejs/kit/vite';
    import { sveltekitOG } from '@ethercorps/sveltekit-og/plugin';

    const config = {
    	plugins: [sveltekit(), sveltekitOG()]
    };
    
    export default config;
    ```

2.  **Create an OG image endpoint**

    Create a file at `/src/routes/og/+server.ts`:

    ```typescript title="/src/routes/og/+server.ts"
    import { ImageResponse } from '@ethercorps/sveltekit-og';
    import type { RequestHandler } from './$types';

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
      return new ImageResponse(template, {
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

3.  **View your OG image**

    Run `pnpm dev` and visit `http://localhost:5173/og` to see your generated image.

## API Reference

The package exposes an `ImageResponse` constructor with the following options:

```typescript
import { ImageResponse } from '@ethercorps/sveltekit-og'
import type { SvelteComponent } from "svelte";

new ImageResponse(
  element: string | SvelteComponent,
  options: {
    width?: number = 1200,
    height?: number = 630,
    backgroundColor?: string = "#fff",
    fonts?: {
      name: string,
      data: ArrayBuffer,
      weight: number,
      style: 'normal' | 'italic'
    }[],
    debug?: boolean = false,
    // Options that will be passed to the HTTP response
    status?: number = 200,
    statusText?: string,
    headers?: Record<string, string>
  },
  // Component props if using a Svelte component
  ComponentProps<SvelteComponent>
)
```

## Features

### Styling

You can style your OG image using TailwindCSS classes (e.g., `tw="bg-gray-50"`) or inline style attributes. Satori supports a subset of CSS, primarily flex-based layouts. For more details, see [Satori’s documentation](https://github.com/vercel/satori#documentation).

### Fonts

Satori supports `ttf`, `otf`, and `woff` font formats. `woff2` is not supported. For the best performance, `ttf` or `otf` are recommended. By default, `@ethercorps/sveltekit-og` includes the 'Noto Sans' font. You can provide your own fonts using the `fonts` option.

### Headers

In development, the image response includes `cache-control: no-cache, no-store` headers. In production, the headers are set to `cache-control: public, immutable, no-transform, max-age=31536000`, which caches the image for one year. The `content-type` is always `image/png`.

## Examples

- **ImageResponse**: [_source_](/src/routes/+server.ts) · [_demo_](https://vercel.sveltekit-og.dev)
- **Component Rendering**: [_source_](/src/routes/sc/+server.ts) · [_demo_](https://vercel.sveltekit-og.dev/sc)

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) to get started.

## Changelog

All notable changes to this project are documented in the [changelog](CHANGELOG.md).

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

This project would not be possible without the following projects:

- [Satori & @vercel/og](https://github.com/vercel/satori)
- [Noto by Google Fonts](https://fonts.google.com/noto)
- [fineshopdesign](https://github.com/fineshopdesign/cf-wasm)

## Authors

- [@theetherGit](https://www.github.com/theetherGit)
- [@etherCorps](https://www.github.com/etherCorps)

## Contributors

- [@jasongitmail](https://github.com/jasongitmail)