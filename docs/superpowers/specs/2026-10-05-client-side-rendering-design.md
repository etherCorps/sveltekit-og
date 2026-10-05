# Client-side rendering (`@ethercorps/sveltekit-og/client`) — design

Date: 2026-10-05
Branch: `feat/client-side-rendering` (PR #74)
Status: approved in chat, pending spec review

## Goal

Let developers generate OG images entirely in the browser — on the main thread and
in web workers — with no server round-trip. Both use cases (live preview in an
editor/CMS, and runtime generation on static/serverless sites) matter equally.

Done means:

- Both engines (takumi, satori) render PNG and SVG on the main thread and in a worker.
- Users download only the engine they pick.
- Rendering works with zero config: no font setup, no cross-origin requests.
- Covered by vitest unit tests, plus a manual browser checklist for what node can't run.
- Documented, and shipped on the `next` dist-tag from `dev` as `4.4.0-next.0`.

## Current state

The branch already implements the feature (~290 lines under `src/lib/client/`, a
playground at `/client`). It rebases cleanly onto `dev`. Gaps:

1. `render.ts` statically imports both engines, so every client bundle ships
   satori + yoga + resvg + takumi and all their wasm.
2. Satori's default fonts come from `cdn-sveltekit-og.ethercorps.io`, which sends no
   `Access-Control-Allow-Origin` — browsers block it. Takumi has no default fonts.
3. `componentToHtml` uses `document`, so components crash inside workers.
4. The satori client test is `it.skip` (node `fetch` can't read `file:` wasm).
5. Unrelated changes ride along: playground adapter switched to `adapter-node`,
   a comment fix in the shared `fonts.ts`, a devDependency reorder.
6. No docs.

## Constraints

- **Server files stay untouched.** Everything lives under `src/lib/client/`. The
  client may import shared, engine-agnostic helpers and the server takumi render
  function, but must not modify them.
- Takumi option pass-through is deferred to the SvelteKit v3 major.
- Wasm and fonts load via Vite `?url` + `fetch(new URL(url, import.meta.url))`:
  same-origin, no CORS, worker-safe. Vite-only by design.

## Public API (unchanged)

```ts
import { ImageResponse, createImage, GoogleFont, CustomFont } from "@ethercorps/sveltekit-og/client";

const res = new ImageResponse(htmlOrComponent, { engine: "satori", format: "svg", fonts }, props);
const url = URL.createObjectURL(await res.blob());
```

- `ImageResponse` extends `Response`; `createImage` is the function form.
- `ClientImageResponseOptions` is a discriminated union on `engine`
  (`"takumi"` default | `"satori"`).
- Satori raster formats are pinned to `png` so `Content-Type` matches the bytes.

## Architecture

```
src/lib/client/
  index.ts           public exports (unchanged)
  types.ts           ClientImageResponseOptions (unchanged)
  image-response.ts  Response subclass (unchanged)
  create.ts          function form (unchanged)
  render.ts          engine dispatch via dynamic import()
  component.ts       NEW: componentToHtml + worker guard (moved out of render.ts)
  fonts.ts           NEW: bundled Noto Sans fallback, loaded once via ?url
  engines/
    satori.ts        existing satori.ts + providers.ts merged; exports render()
    takumi.ts        NEW: wraps server takumi/render.ts, injects fallback fonts
  assets/
    NotoSans-Regular.ttf   (~583 KB)
    NotoSans-Bold.ttf      (~583 KB)
```

### Engine dispatch (`render.ts`)

```ts
const html = typeof element === "string" ? element : componentToHtml(element, props ?? {});
const engine = options.engine === "satori"
	? await import("./engines/satori.js")
	: await import("./engines/takumi.js");
return engine.render(html, imageOptions);
```

Each engine module exports `render(html, options): Promise<Uint8Array | string>`.
Dynamic import makes Vite emit one chunk per engine; the other engine's JS and wasm
are never fetched. Response-only keys (`status`, `statusText`, `headers`) are still
stripped before reaching the engine.

### Components and workers (`component.ts`)

- Main thread: unchanged behaviour — `mount` into a detached shadow root,
  `flushSync`, read `innerHTML`, `unmount`. Inline styles only (scoped styles are
  not captured — documented limitation).
- Worker (`typeof document === "undefined"`): passing a component throws
  `ImageResponseError` with new code `COMPONENT_IN_WORKER` and a message telling the
  user to pass an HTML string. HTML strings work normally.
- `COMPONENT_IN_WORKER` is added to `ErrorCodes` in `helpers/error-handler.ts`.
  This is an additive constant in a shared helper, not a server render-path change.

### Default fonts (`fonts.ts`)

- Two TTFs ship in `client/assets/`, imported with `?url`.
- `defaultClientFonts()` fetches both once (memoized; a rejected load clears the
  cache so the next call retries) and returns them in each engine's font shape.
- Used only when the caller passes no `fonts` (undefined or empty array). Satori
  no longer touches `default_fonts()` / the CDN on the client path.
- Package size grows by ~1.16 MB; only client-entry users download the fonts at
  runtime, and only when they don't pass their own.

### Error handling

Unchanged pattern: every async step goes through `handleAsync` with an
`ErrorCodes` value; `buildImageResponse` surfaces failures as `ImageResponseError`
on the response body stream. Wasm/font init failures clear their memoized promise
so the next render retries.

## Testing

### vitest (node) — `src/client.test.ts`, extended

Existing cases stay (takumi default, satori format pinning, svg content-type,
response-only options, `createImage`). Additions:

- `vi.mock("$lib/client/fonts.js")` returns in-memory font bytes, because the real
  `?url` fetch can't run in node. The takumi render cases keep working through it.
- Lazy dispatch: with engines mocked, `engine: "takumi"` never imports
  `engines/satori.js`, and vice versa.
- Worker guard: with `document` undefined, a component throws
  `COMPONENT_IN_WORKER`; an HTML string renders.
- Font fallback: no `fonts` → `defaultClientFonts()` is used; explicit `fonts` →
  it is not called.
- The satori render case stays `it.skip` in node (its wasm loads via `?url` fetch),
  pointing to the manual checklist below.

No browser test runner and no new CI workflow — tests run locally with `pnpm test`.

### Manual browser checklist (before marking the PR ready)

Run `pnpm dev` in `packages/sveltekit-og`, Chromium devtools Network tab open:

- `/client` playground: both engines × png/svg render, for the HTML editor and the
  component tab.
- No requests to `cdn-sveltekit-og.ethercorps.io` (fonts are same-origin).
- Takumi selected on a fresh load: no `yoga.wasm` or resvg wasm requested.
- `/client/worker` (small dev-only route, not shipped): a module worker renders an
  HTML string with both engines; posting a component shows `COMPONENT_IN_WORKER`.

## Cleanup

- Rebase onto `dev`; retarget PR #74 base from `main` to `dev`.
- Squash the two identical `feat(client)` commits; land each gap fix as its own commit.
- Revert: playground `adapter-node` switch, `fonts.ts` comment fix, devDependency reorder.

## Docs and release

- New page `apps/docs/src/content/usage/client.md` ("Client-side Rendering",
  priority 4, "Available from v4.4.0" callout): usage per engine with HTML and a
  component; workers (HTML strings only, `COMPONENT_IN_WORKER`); bundled default
  fonts and passing your own; Vite-only requirement; per-engine lazy loading and
  rough download sizes; scoped-styles limitation.
- `CHANGELOG.md` → `Unreleased` → `Added`.
- After merge to `dev`: `pnpm release` → `4.4.0-next.0` → CI publishes `next`
  (avoids the already-published `4.3.1-next.x`). Stable `4.4.0` later via
  `dev` → `main`.

## Out of scope

- Takumi option pass-through (SvelteKit v3 major).
- Automated browser tests (Playwright / vitest browser mode); a CI workflow for tests.
- Non-Vite bundlers.
- Font subsetting / WOFF2 to shrink the bundled fonts.
- Capturing scoped component styles on the client.
