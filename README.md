# sveltekit-og — monorepo

Dynamically generate Open Graph images in SvelteKit from HTML+CSS or a Svelte component — no headless browser. This repo is a [pnpm workspace](https://pnpm.io/workspaces) holding the library, its docs site, and per-runtime deployment examples.

> Using the library? See **[packages/sveltekit-og/README.md](./packages/sveltekit-og/README.md)** or the docs at **[sveltekit-og.dev](https://sveltekit-og.dev)**. This file is for working *on* the repo.

## Layout

| Path | Package | What |
|------|---------|------|
| `packages/sveltekit-og` | `@ethercorps/sveltekit-og` | The library (published to npm) |
| `apps/docs` | `@svecodocs/docs` | Docs site → [sveltekit-og.dev](https://sveltekit-og.dev) |
| `examples/*` | — | One deployable app per runtime: `node`, `deno`, `netlify`, `vercel`, `cf-pages`, `cf-workers`, plus `satori-only` / `takumi-only` |
| `examples/shared` | `@examples/shared` | Route logic + templates shared by the examples |

## Develop

```sh
pnpm install          # at the repo ROOT — one lockfile, resolves all workspace:* deps
pnpm dev              # run the library dev server
pnpm docs:dev         # run the docs site
pnpm test             # library test suite
pnpm build            # build the library
pnpm build:examples   # build every example
pnpm check            # svelte-check across the workspace
pnpm lint             # lint across the workspace
```

Target a single package with pnpm's filter, e.g. `pnpm -F ./examples/deno-build build`.

## Deploy

- **Examples & docs**: build at the repo root (`pnpm install`, then `pnpm -F <name> build`). Hosts with monorepo support (Vercel, Netlify, Cloudflare) install at the repo root and build the target package.
- **Deno Deploy** has no monorepo build support — set its install command to run at the repo root (`pnpm install`) and build with `pnpm -F ./examples/deno-build... build`; see [`examples/deno-build`](./examples/deno-build).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). License: [MIT](./LICENSE).
