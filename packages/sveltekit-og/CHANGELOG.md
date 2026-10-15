# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- `svelte/server` loads on the first component render instead of at import, so HTML-string renders never pay for it: cold `html → png` on Node is ~20% faster than 4.4.0 on both engines (Bun: Takumi ~8%; Cloudflare Workers: unchanged, SvelteKit's page SSR evaluates it anyway).
- Fonts resolve once per font object within an isolate: a module-level `fonts: [...]` never re-runs its loaders (Google Fonts fetch, file read) on the next render. A failed load is retried.
- `/client` with Satori hands the yoga wasm `Response` to Satori's loader, which compiles it with `WebAssembly.instantiateStreaming` instead of buffering and compiling synchronously. ReSVG already streamed; Takumi can't until takumi-js exposes its wasm URL.
- Second render in an isolate performs no wasm instantiate/compile and no font fetch on either engine (asserted with spies in `src/perf.test.ts`).

### Added

- Cold benches per runtime: `pnpm bench:cold:bun` and `pnpm bench:workers` (miniflare via the cf-workers example), with their baselines.

## [5.0.0-next.0] - 2026-10-15

See the [v5 migration guide](../../docs/migration/v5.md).

### Changed

- **Breaking:** Takumi is the default engine on every entry. The root entry rendered with Satori on v4; add `engine: "satori"` (and install its peers) to keep identical output.
- **Breaking:** no engine is installed for you. `satori` and `@resvg/resvg-wasm` join `takumi-js` as optional peer dependencies. A call to an engine that isn't installed rejects with `ENGINE_NOT_INSTALLED` and the install command; the `sveltekitOG()` Vite plugin keeps uninstalled engines out of the bundle (`engines: [...]` pins the list). `takumi-js` is no longer needed to use Satori on `/client`.
- **Breaking:** one public API on the root entry and `/client`: `ImageResponse`, `createImage` (returns a `Response`) and `renderImage` (returns bytes, or a string for svg). `engine` narrows the options to the engine's shape.
- **Breaking:** error codes reach the caller intact. Failures are no longer wrapped as `UNKNOWN_ERROR: Failed to generate PNG` with the real error in `originalError`; the specific `ImageResponseError` is thrown, through `arrayBuffer()`, `fetch` and prerendering alike.
- **Breaking:** `engine: "satori"` with a format Satori can't emit (`webp`, `jpeg`, …) rejects with `UNSUPPORTED_FORMAT` instead of silently rendering a PNG.
- Component props are type-checked at the call site: required props are required, HTML strings take none.
- `sveltekitOG()` returns an array of plugins (the SSR wasm loader plus the engine stubs); `plugins: [sveltekit(), sveltekitOG()]` still works.
- Peers: `svelte ^5.0.0` (was missing), `@sveltejs/kit ^2.0.0 || ^3.0.0`.
- Internals: one render pipeline (`core/`) behind the server and client entries; each engine's code exists once and loads lazily.

### Added

- `fonts` takes `GoogleFont`, `CustomFont` or a raw `{ name, data, weight, style }` descriptor on both engines; `resolveFonts` is no longer required (still exported).
- Pass-through options spread last into the engine call: `takumi` (takumi-js `render`/`renderSvg`), `satori` (`satori()`), `resvg` (ReSVG constructor).
- `ImageResponseError` and `ErrorCodes` exported from the root entry and `/client`.
- `renderImage` on `/client`.
- Warm and cold benchmarks (`pnpm bench:compare`, `pnpm bench:cold`) against a v4.4.0 baseline built on the same toolchain; run on every PR.

### Deprecated

- `@ethercorps/sveltekit-og/takumi`: now an alias of the root entry (plus the `Takumi*` type names). Removed in v6.

### Fixed

- Server-side ReSVG now frees its wasm objects after each render, so long-running Node servers don't grow wasm memory.
- Takumi-only server apps no longer evaluate the Satori providers.

## [4.4.0] - 2026-10-13

### Added

- SvelteKit 3 (Vite 8) support alongside SvelteKit 2; the `sveltekitOG()` plugin uses the Environment API when present. Examples for Satori, Takumi and Bun run on Kit 3.
- Official `@sveltejs/adapter-bun` example (`examples/bun-build`) and a Bun runtime guide.
- `@ethercorps/sveltekit-og/client`: render OG images in the browser or a web worker with Takumi (default) or Satori + ReSVG, no server request. Engines load lazily (only the one you pick is downloaded); Satori falls back to bundled Noto Sans served same-origin; components render on the main thread, HTML strings everywhere; passing a component in a worker rejects with `COMPONENT_IN_WORKER`. Errors reach `.blob()`/`.arrayBuffer()`/`.text()` as `ImageResponseError` with a `code`. Requires `takumi-js` with either engine; workers need `worker: { format: "es" }` in `vite.config`.

### Fixed

- Empty elements (`<div style="width:14px;height:14px"></div>` as a dot or divider) made Satori throw `Expected <div> to have explicit "display: flex" … if it has more than one child node`: satori-html emits `children: []` for them and Satori reads any array as "multiple children". Empty children are now dropped before rendering, in both the server and client paths.
- Svelte components with `css="injected"` styles spanning multiple lines (e.g. a multi-line `linear-gradient(...)`) failed with `object null is not iterable` on satori 0.25. The injected `<style>` is now whitespace-normalized before parsing, like HTML strings already were.
- `sveltekitOG()` Vite plugin now applies the wasm loader to the SSR build only. It used to run on the client build too, which broke the `/client` entry's Takumi wasm (`WebAssembly.instantiate(): Import #0 "./takumi_wasm_bg.js"`). Gated per environment, so it works on SvelteKit 2 (Vite 5/6) and SvelteKit 3 (Vite 8, Environment API).

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
