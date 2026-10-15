[![npm version](https://flat.badgen.net/npm/v/@ethercorps/sveltekit-og?color=orange)](https://npmjs.com/package/bits-ui)
[![npm downloads](https://flat.badgen.net/npm/dm/@ethercorps/sveltekit-og?color=orange)](https://npmjs.com/package/@ethercorps/sveltekit-og)
[![license](https://flat.badgen.net/github/license/ethercorps/sveltekit-og?color=orange)](https://github.com/ethercorps/sveltekit-og/blob/main/LICENSE)

# SvelteKit Open Graph Image Generation

Dynamically generate Open Graph images from an HTML+CSS template or Svelte component. No headless browser required.

Pick the rendering engine that fits your needs; install only the one you use:

- **[Takumi](https://takumi.kane.tw)** (default) — a Rust/WASM engine with a built-in font and more output formats (`png`, `webp`, `jpeg`, `ico`, `svg`, …).
- **Satori** — HTML → SVG → PNG, based on [Satori](https://github.com/vercel/satori#documentation). Select it with `engine: "satori"`.

Same API on the server and in the browser (`@ethercorps/sveltekit-og/client`). Upgrading from v4? See the [migration guide](https://github.com/etherCorps/sveltekit-og/blob/main/docs/migration/v5.md).

## Table of Contents

- [SvelteKit Open Graph Image Generation](#sveltekit-open-graph-image-generation)
    - [Table of Contents](#table-of-contents)
    - [Docs](#docs)
    - [Installation](#installation)
    - [Usage](#usage)
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
# Takumi (default)
pnpm add @ethercorps/sveltekit-og takumi-js

# Satori
pnpm add @ethercorps/sveltekit-og satori @resvg/resvg-wasm
```

Engines are optional peer dependencies. Calling one that isn't installed fails with `ENGINE_NOT_INSTALLED` and the command to run.

## Usage

```ts
// src/routes/og.png/+server.ts
import { ImageResponse } from "@ethercorps/sveltekit-og";

export const GET = () =>
	new ImageResponse(`<div style="display:flex;font-size:64px">Hello</div>`, {
		width: 1200,
		height: 630,
		// engine: "satori", format: "svg", fonts: [new GoogleFont("Inter")], ...
	});
```

`createImage(...)` is the same as a function; `renderImage(...)` returns the bytes instead of a `Response`. Svelte components work in place of the HTML string, with their props as the third argument.

For detailed usage instructions, please see the [Getting Started](https://sveltekit-og.dev/docs/getting-started) section of our documentation.

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
- [Takumi](https://takumi.kane.tw)
- [Noto by Google Fonts](https://fonts.google.com/noto)
- [fineshopdesign](https://github.com/fineshopdesign/cf-wasm)

## Authors

- [@theetherGit](https://www.github.com/theetherGit)
- [@etherCorps](https://www.github.com/etherCorps)

## Contributors

- [@jasongitmail](https://github.com/jasongitmail)
