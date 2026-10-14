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
- Rendering works with zero config: no font setup, no cross-origin font requests
  (emoji still come from jsdelivr, which allows CORS — unchanged from the server).
- Covered by vitest unit tests, plus a manual browser checklist for what node can't run.
- Documented, and shipped on the `next` dist-tag from `dev` as `4.4.0-next.0`.

## Current state

The branch already implements the feature (~290 lines under `src/lib/client/`, a
playground at `/client`). It rebases cleanly onto `dev`. Gaps:

1. `render.ts` statically imports both engines, so every client bundle ships
   satori + yoga + resvg + takumi and all their wasm.
2. Satori's default fonts come from `cdn-sveltekit-og.ethercorps.io`, which sends no
   `Access-Control-Allow-Origin` — browsers block it. Takumi is unaffected: its wasm
   embeds a sans-serif fallback (confirmed by `takumi.test.ts` and the font tables
   in `takumi_wasm_bg.wasm`).
3. `componentToHtml` uses `document`, so components crash inside workers.
4. Satori client rendering can't run under vitest in node (its wasm loads via
   `?url` fetch). Stays manual — see Testing.
5. Unrelated changes ride along: playground adapter switched to `adapter-node`,
   a comment fix in the shared `fonts.ts`, a devDependency reorder.
6. No docs.

## Constraints

- **Server files stay untouched.** Everything lives under `src/lib/client/`. The
  client may import shared, engine-agnostic helpers and the server takumi render
  function, but must not modify them.
- Takumi option pass-through is deferred to the SvelteKit v3 major.
- Satori/yoga/resvg wasm and the bundled fonts load via Vite `?url` +
  `fetch(new URL(url, import.meta.url))`: same-origin, no CORS, worker-safe.
  Takumi wasm loads through takumi-js's own `auto` loader. Vite-only by design.

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
  render.ts          engine dispatch via dynamic import(); satori font fallback
  component.ts       NEW: componentToHtml (moved out of render.ts), lazy-loaded
  fonts.ts           NEW: bundled Noto Sans fallback for satori, loaded once via ?url
  engines/
    satori.ts        existing satori.ts + providers.ts merged; exports render()
    takumi.ts        NEW: re-exports server takumi/render.ts; exists only as the
                     lazy-load boundary (takumi has its own built-in font)
  assets/
    NotoSans-Regular.ttf   (~583 KB)
    NotoSans-Bold.ttf      (~583 KB)
```

### Engine dispatch (`render.ts`)

```ts
let html: string;
if (typeof element === "string") {
	html = element;
} else {
	if (typeof document === "undefined") {
		throw new ImageResponseError(
			"Svelte components can't be rendered in a worker; pass an HTML string instead.",
			ErrorCodes.COMPONENT_IN_WORKER
		);
	}
	const { componentToHtml } = await import("./component.js");
	html = componentToHtml(element, props ?? {});
}

if (engine === "satori" && !imageOptions.fonts?.length) {
	imageOptions.fonts = await (await import("./fonts.js")).defaultClientFonts();
}

const mod = engine === "satori"
	? await import("./engines/satori.js")
	: await import("./engines/takumi.js");
return mod.render(html, imageOptions);
```

Each engine module exports `render(html, options): Promise<Uint8Array | string>`.
Dynamic imports make Vite emit one chunk per engine (and one for the component
mounter, one for the fonts); nothing is fetched unless that path runs. String-only
users and workers never ship Svelte's `mount` runtime. Response-only keys (`status`,
`statusText`, `headers`) are still stripped before reaching the engine.

The satori font fallback lives here rather than in `engines/satori.ts` because the
engine module can't run in node (wasm), and `render.ts` can — so the fallback is
unit-testable with `fonts.js` mocked.

### Components and workers (`component.ts`)

- Main thread: unchanged behaviour — `mount` into a detached shadow root,
  `flushSync`, read `innerHTML`, `unmount`. Inline styles only (scoped styles are
  not captured — documented limitation).
- Worker (`typeof document === "undefined"`): passing a component throws
  `ImageResponseError` with new code `COMPONENT_IN_WORKER` and a message telling the
  user to pass an HTML string. HTML strings work normally.
- `COMPONENT_IN_WORKER` is added to `ErrorCodes` in `helpers/error-handler.ts`.
  This is an additive constant in a shared helper, not a server render-path change.
- `ImageResponseError` is not exported from the client entry (parity with the
  server entry); users check `error.code === "COMPONENT_IN_WORKER"`.

### Default fonts (`fonts.ts`) — satori only

- Two TTFs ship in `client/assets/`, imported with `?url`.
- `defaultClientFonts()` fetches both once (memoized; a rejected load clears the
  cache so the next call retries) and returns satori's `{ name, data, weight, style }`
  shape.
- Used only when `engine: "satori"` and the caller passes no `fonts` (undefined or
  empty array). Satori no longer touches `default_fonts()` / the CDN on the client
  path. Takumi needs nothing: it renders with the font embedded in its wasm.
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
  `?url` fetch can't run in node. Only the satori fallback path touches it.
- Lazy dispatch: with engines mocked, `engine: "takumi"` never imports
  `engines/satori.js`, and vice versa.
- Worker guard: with `document` undefined, a component throws
  `COMPONENT_IN_WORKER`; an HTML string renders.
- Font fallback: `engine: "satori"` with no `fonts` → `defaultClientFonts()` is
  called and its result reaches the (mocked) engine; explicit `fonts`, or
  `engine: "takumi"` → it is not called.
- The satori render case stays `it.skip` in node (its wasm loads via `?url` fetch),
  pointing to the manual checklist below.

No browser test runner and no new CI workflow — tests run locally with `pnpm test`.

### Manual browser checklist (before marking the PR ready)

Run `pnpm dev` in `packages/sveltekit-og`, Chromium devtools Network tab open:

- `/client` playground: both engines × png/svg render, for the HTML editor and the
  component tab.
- No requests to `cdn-sveltekit-og.ethercorps.io` (fonts are same-origin).
- Takumi selected on a fresh load: no `yoga.wasm` or resvg wasm requested.
- Satori selected on a fresh load: no `takumi_wasm_bg.wasm` requested.
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

## Known costs (accepted)

- `svelte/server` lands in the client bundle: `takumi/render.ts` → `toJSX.ts` →
  `to-html.ts` imports it statically. Never called on the client (components are
  pre-rendered to strings), so it is dead weight, not breakage. Removing it means
  touching shared server files — deferred with the rest of the v3 realignment.
- The client satori path parses HTML with `satori-html` → `ultrahtml` in the
  user's bundle. The repo's ultrahtml patch does not ship to consumers; Vite's
  default esbuild minifier keeps the `¶` sentinel intact, so this only bites users
  who minify with terser `ascii_only`. Documented, not worked around.

## Out of scope

- Takumi option pass-through (SvelteKit v3 major).
- Automated browser tests (Playwright / vitest browser mode); a CI workflow for tests.
- Non-Vite bundlers.
- Font subsetting / WOFF2 to shrink the bundled fonts.
- Capturing scoped component styles on the client.
