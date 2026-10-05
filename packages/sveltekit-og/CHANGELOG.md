# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `@ethercorps/sveltekit-og/client`: render OG images in the browser or a web worker with Takumi (default) or Satori + ReSVG, no server request. Engines load lazily (only the one you pick is downloaded); Satori falls back to bundled Noto Sans served same-origin; components render on the main thread, HTML strings everywhere; passing a component in a worker rejects with `COMPONENT_IN_WORKER`. Errors reach `.blob()`/`.arrayBuffer()`/`.text()` as `ImageResponseError` with a `code`.

## [4.3.0] - 2026-07-10

### Added

- Takumi rendering engine via the new `@ethercorps/sveltekit-og/takumi` export, on takumi-js v2 (2.0.1 stable).
- `ImageResponseError` for render failures.
- Runtime-agnostic debug logger.
- Caching for custom font data.
- Node.js engine requirement in `package.json`.

### Fixed

- PNG generation on Cloudflare Workers: resvg wasm is now vendored and loaded as bytes on Node, with separate Node/edge paths.
- Yoga layout error on the Cloudflare runtime.
- Logger no longer depends on `node:async_hooks` (`enterWith` is unsupported on Cloudflare).
- Props not passed to the component when rendering.
- Generic `Component` type in the image creation functions.
- Takumi input uses the same VNode format as the Satori path.
- `repository` owner casing, so npm provenance verifies.

## [4.2.1] - 2025-11-28

### Changed

- Package metadata: MIT license, homepage, repository, funding, author and description.

## [4.2.0] - 2025-11-23

### Added

- Font utilities via `@ethercorps/sveltekit-og/fonts`.

## [4.0.0]

### Added

- Support for Node.js, Deno, Cloudflare Pages, Cloudflare Workers, Vercel and Netlify.
- No support for `bun`.
- Use of satori for HTML to React like element conversion.

## [3.0.0]

### Changed

- Only support for Node.js based runtime.

### Removed

- Removed support for Deno, Cloudflare Workers, Vercel and Netlify.

## [1.2.3]

### Changed

- You have to install dependency by yourself which will make it easier to build for all platforms.

## [1.2.2]

### Changed

- We don't provide access to satori from `@ethercorps/sveltekit-og`.

## [1.0.0]

### Added

- HTML to React-like element object converter out of the box with svelte compiler.

### Changed

- Changed to function based instead of class based ImageResponse and componentToImageResponse.
- Removed `@resvg/resvg-wasm` with `@resvg/resvg-js` because of internal errors.
