[![npm version](https://flat.badgen.net/npm/v/@ethercorps/sveltekit-og?color=orange)](https://npmjs.com/package/bits-ui)
[![npm downloads](https://flat.badgen.net/npm/dm/@ethercorps/sveltekit-og?color=orange)](https://npmjs.com/package/@ethercorps/sveltekit-og)
[![license](https://flat.badgen.net/github/license/ethercorps/sveltekit-og?color=orange)](https://github.com/ethercorps/sveltekit-og/blob/main/LICENSE)

# SvelteKit Open Graph Image Generation

Dynamically generate Open Graph images from an HTML+CSS template or Svelte component. No headless browser required.

Pick the rendering engine that fits your needs:

- **Satori** (default) — HTML → SVG → PNG, based on [Satori](https://github.com/vercel/satori#documentation).
- **[Takumi](https://takumi.kane.tw)** — a Rust/WASM engine with more output formats (`webp`, `jpeg`, `ico`, `svg`, …) and a built-in font, available from `@ethercorps/sveltekit-og/takumi` (v4.3.0+).

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
pnpm install @ethercorps/sveltekit-og
```

## Usage

For detailed usage instructions, please see the [Getting Started](https://sveltekit-og.dev/docs/getting-started) section of our documentation.

Prefer the Takumi engine — more output formats and a built-in font? See the [Takumi Engine](https://sveltekit-og.dev/docs/usage/takumi) guide.

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
