# Milestone: v5.0.0

**Goal:** one API across server and client with Takumi as the default engine, engines installed on demand, docs on Nimbus, measured performance.

**Release channel:** `v5` branch → `5.0.0-next.*` on the `next` tag → `5.0.0`. 4.x stays on `main` for fixes until 5.0.0 ships.

**Decisions (locked):**

- Default engine everywhere: Takumi.
- `takumi-js`, `satori`, `@resvg/resvg-wasm` are optional peers; the developer installs the engine they use.

**Order:** #1 → #2 → #3 → #4 → #5 → #6, with #7 and #8 in parallel from #3 onward; #9 after #5; #10 last.

---

## #1 Benchmark baseline on 4.4.0

**Scope:** Record the 4.4.0 numbers before any core change so every refactor is measured against them.

**Tasks**

- Run `pnpm bench:save` on `v4.4.0` and commit `benchmarks/baseline.json`.
- Add cases that are missing today: cold render (fresh module graph) and warm render, per engine, for HTML string and Svelte component.
- Add `bench:compare` to CI as a non-blocking check (made blocking in #8).

**Acceptance**

- `benchmarks/baseline.json` committed from the 4.4.0 tag.
- CI job prints the comparison on every PR to `v5`.

---

## #2 Shared core: one render pipeline for server and client

**Scope:** Move the element → HTML → engine → bytes pipeline into `src/lib/core`. Server and client differ only in how a Svelte component becomes HTML and how assets load.

**Tasks**

- `core/types.ts`: `Engine`, `BaseOptions`, `TakumiOptions`, `SatoriOptions`, `ImageOptions`, `ResponseOptions`, `FontInput`.
- `core/engines/takumi.ts`, `core/engines/satori.ts`: each exports `render(html, opts) → Uint8Array | string`; loaded with dynamic `import()` so only the chosen engine is fetched/evaluated.
- `core/render.ts`: picks the engine (default `takumi`), validates `format` against the engine, resolves fonts, calls the engine.
- `server/`: component → HTML via `svelte/server`; `client/`: component → HTML via shadow-root capture (move from the current `/client` code).
- Single `CONTENT_TYPES`, single error-code enum, single logger.

**Acceptance**

- `/client` and the root entry import the same `core/render.ts`; no duplicated engine code.
- Existing test suite passes; new tests cover engine selection, format validation and font resolution for both engines.
- Bench: warm render within ±5% of #1 baseline per engine.

**Depends on:** #1

---

## #3 Unified public API

**Scope:** Root entry and `/client` export the same three names with the same signatures.

**Public surface**

```ts
class ImageResponse<T> extends Response            // (element, options?: ImageOptions & ResponseOptions, props?)
function createImage(element, options?, props?)   // → ImageResponse
function renderImage(element, options?, props?)   // → Promise<Uint8Array | string>  (svg → string)
```

- `engine` is a discriminant; omitted narrows to `TakumiOptions`.
- `fonts` accepts `GoogleFont | CustomFont | raw descriptor` for both engines; resolution is internal. `resolveFonts` stays exported for pre-resolving/caching.
- Pass-through objects: `takumi`, `satori`, `resvg`.
- `./takumi` entry kept as a no-op re-export of the root entry (removed in v6).
- `format` not supported by the engine → `UNSUPPORTED_FORMAT` (no silent PNG fallback).

**Acceptance**

- `publint` clean; `exports` map has `.`, `./client`, `./fonts`, `./plugin`, `./takumi` (alias).
- Type test: `createImage(html, { format: "webp" })` compiles; `createImage(html, { engine: "satori", format: "webp" })` is a type error.
- `GoogleFont` works on the root entry with both engines without calling `resolveFonts`.
- Server `createImage` returns a `Response`; `renderImage` returns bytes/string.

**Depends on:** #2

---

## #4 Optional engines + Vite plugin stubs

**Scope:** Make all three engine packages optional peers and keep builds working when one is absent.

**Tasks**

- `package.json`: move `satori`, `@resvg/resvg-wasm` to `peerDependencies` with `peerDependenciesMeta.optional: true` alongside `takumi-js`.
- `./plugin`: at config time, try to resolve each engine package; alias the missing engine's module (`core/engines/<engine>.ts`) to a stub that throws `ENGINE_NOT_INSTALLED` with the install command.
- Error message names the package and the command: `Engine "satori" is not installed. Run: pnpm add satori @resvg/resvg-wasm`.
- Drop the current client-entry requirement that `takumi-js` must be installed to use Satori.

**Acceptance**

- `vite build` succeeds in each of: Takumi only, Satori only, both, neither.
- Runtime call to a missing engine rejects with `code === "ENGINE_NOT_INSTALLED"` on server and client.
- Bundle visualizer shows no Satori chunk in a Takumi-only app and vice versa.

**Depends on:** #3

---

## #5 Migration guide and `5.0.0-next.0`

**Scope:** Document the breaking changes and publish the first `next` release.

**Guide contents**

- Install step: engines are no longer installed for you.
- Default engine changed: root-entry users are now on Takumi. To keep output identical, add `engine: "satori"` and install the Satori peers.
- `./takumi` import → root import (alias still works).
- `resolveFonts` no longer required for Satori.
- `createImage` now returns a `Response`; use `renderImage` for bytes.
- New error codes: `ENGINE_NOT_INSTALLED`, `UNSUPPORTED_FORMAT`.

**Acceptance**

- `docs/migration/v5.md` (or the Nimbus page from #7) reviewed against the type tests in #3.
- `5.0.0-next.0` published to `next`; `examples/*` updated and building against it.

**Depends on:** #3, #4

---

## #6 Server-side lazy engines and per-isolate caching

**Scope:** The performance work on the package itself.

**Tasks**

- Confirm engines load lazily on the server (falls out of #2); measure cold start on Workers (miniflare), Vercel Edge, Node, Bun.
- Memoize `default_fonts()` (currently loaded on every Satori call without `fonts`).
- One WASM instantiate per isolate for Satori, ReSVG and Takumi; use `WebAssembly.compileStreaming` where the wasm arrives over `fetch`.
- Cache resolved fonts keyed by font identity within an isolate.

**Acceptance**

- Cold render per engine improves over #1 baseline on at least Workers and Node; numbers recorded in the benches.
- Second render in the same isolate performs no font fetch and no wasm instantiate (asserted in tests with spies).

**Depends on:** #2

---

## #7 Docs site on Nimbus (Astro)

**Scope:** New `apps/www` scaffolded with `create-nimbus-docs`, consuming `@next`. Current `apps/docs` keeps deploying until cutover.

**Tasks**

- Scaffold with `create-nimbus-docs` (Astro 7, Tailwind via `@tailwindcss/vite`); pin versions.
- Port `.md` content to MDX; map `@svecodocs/kit` `Callout`/`Tabs`/`TabItem` to Nimbus components.
- Replace `build-release-data.js` (octokit), search and sitemap scripts with Astro content loaders / build hooks.
- Per-page OG images: port `/api/og/image/[...slug].png` to an Astro endpoint using the v5 root API (dogfoods the framework-agnostic core).
- Keep every existing `/docs/...` URL; add `_redirects` for anything that moves.
- Deploy to Cloudflare; preview per PR.

**Versioned docs (decisions)**

- v4 docs are kept on a `v4` git branch, not as a folder on `main`. Reason: `apps/docs` depends on the workspace package, which on `main` resolves to v5.
- Create the branch from the last 4.x tag (`git branch v4 v4.4.0`, or from `main` at the last commit before v5 work).
- The existing Cloudflare project is renamed and serves `v4.sveltekit-og.dev`, with its production branch set to `v4`, building `apps/docs`. 4.x patch releases are PRs to `v4`; the docs redeploy with them.
- Every v4 page gets a banner ("older version, see v5 equivalent") and a `rel="canonical"` pointing at the v5 page.
- The `v4` branch release script publishes with `--tag v4` so 4.x releases never reclaim `latest` once 5.0.0 ships.
- The v4 site states the support window: what is backported (security and critical fixes) and the end date.

**Version switcher (decisions)**

- The Nimbus site uses Nimbus's built-in versioning (VersionSwitcher) from v5 onward. For 5.0 the switcher has two entries: "v5" (this site) and "v4" linking out to `v4.sveltekit-og.dev`.

**Tagged GitHub links (decisions)**

- No docs link may point at `tree/main` or `blob/main`. Every repo link uses the tag of the release that docs version documents.
- Implement as: one `repoRef` value in the site config (e.g. `v5.0.0`), bumped in the release checklist; a `<RepoLink path="examples/bun-build" />` component that builds URLs from `repoRef` (authors write paths, never URLs); a build-time check that fails the site build if any `.mdx` contains `github.com/etherCorps/sveltekit-og/(tree|blob)/main`.
- On the `v4` branch, `repoRef` is the latest 4.x tag and is bumped in that branch's release step. Do a one-time rewrite of `tree/main` → the final 4.x tag before the frozen build.

**Acceptance**

- Every page from the current sidebar exists at the same path.
- OG endpoint renders with Takumi by default and Satori via `engine: "satori"`.
- Lighthouse and link check pass in CI.
- Version switcher present with a working v4 entry.
- v4 pages carry the banner and canonical tag.
- Built site contains zero `main` repo links (check passes in CI).
- `v4.sveltekit-og.dev` deploys from the `v4` branch.

**Depends on:** #3 (for the OG endpoint; content port can start immediately)

---

## #8 Playground port + bench gate in CI

**Scope:** Move the playground to the Nimbus site and make benchmarks block regressions.

**Playground**

- Mount the Svelte playground as a `client:only="svelte"` island via `@astrojs/svelte`.
- `worker: { format: "es" }` in the Astro Vite config; `takumi-js` and Satori peers installed in `apps/www`.
- Add an engine toggle; the generated snippet shows the unified `createImage(...)` call.

**CI**

- `bench:compare` fails the PR on >10% regression in any warm-render case (threshold adjustable).
- Publish a "Benchmarks" docs page with cold/warm numbers per engine and runtime, regenerated on release.

**Acceptance**

- Playground renders with both engines in the Nimbus site; worker mode works in `astro build`.
- A deliberate slowdown PR fails CI.

**Depends on:** #7, #6

---

## #9 `5.0.0` release and docs cutover

**Tasks**

- Final `next` → `5.0.0`; GitHub release notes link the migration guide.
- Point `sveltekit-og.dev` at `apps/www`; keep the old Pages project for one week as rollback.
- Announcement posts (X, LinkedIn, dev.to) in the usual format.

**Acceptance**

- `npm i @ethercorps/sveltekit-og` resolves `5.0.0`; `latest` tag updated.
- sveltekit-og.dev serves the Nimbus site; old URLs resolve.

**Depends on:** #5, #7, #8

---

## #10 Deprecate the svecodocs fork

**Tasks**

- Check other sites for `npm:@ethercorps/svecodocs` aliases.
- `npm deprecate @ethercorps/svecodocs@"*" "Replaced by the Nimbus-based docs: https://github.com/etherCorps/sveltekit-og/tree/main/apps/www"`.
- Archive the fork repo with a README pointer.
- Delete `apps/docs` from `main` only; it continues to live on the `v4` branch.

**Acceptance**

- `npm view @ethercorps/svecodocs deprecated` returns the message.
- `apps/docs` gone; monorepo builds.

**Depends on:** #9
