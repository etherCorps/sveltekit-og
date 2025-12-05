# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [4.3.1-next.3] - 2025-12-05

### Changed
- Internal changes and improvements.

## [4.2.0]

### Added
- Added utilities for fonts.

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
