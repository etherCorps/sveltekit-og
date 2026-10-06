// The client entry renders in the browser (satori loads its wasm from bundler
// `?url` assets), so this page is client-only — keeps the browser wasm providers
// out of the SSR/adapter bundle.
export const ssr = false;
