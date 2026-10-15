import { defineConfig } from "astro/config";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";
import svelte from "@astrojs/svelte";
import nimbus, { defineConfig as defineNimbusConfig } from "nimbus-docs";
import { tableScroll } from "nimbus-docs/markdown";
import { sveltekitOG } from "@ethercorps/sveltekit-og/plugin";
import { repoUrl } from "./src/site";

const nimbusConfig = defineNimbusConfig({
  site: "https://sveltekit-og.dev",
  title: "SvelteKit OG",
  description:
    "Generate Open Graph images from HTML or Svelte components with Takumi or Satori — on the server, at the edge, or in the browser.",
  locale: "en",
  homeLabel: "Docs",
  github: repoUrl,
  // Edit links target the branch edits land on; reference links in content go
  // through <RepoLink>, which pins the release tag (`repoRef`).
  editPattern: `${repoUrl}/edit/v5/apps/docs/{path}`,
  socialImage: "/api/og/image/docs.png", // entry id of docs/index.mdx is "docs"
  socialImageAlt: "SvelteKit OG documentation",
  // v5 is the only version hosted here; v4 lives at v4.sveltekit-og.dev (see
  // src/site.ts `externalVersions` and the VersionSwitcher in the header).
  versions: { current: "v5", others: [] },
  // Same structure and paths as the previous site; page order inside groups comes
  // from frontmatter `sidebar.order` (the old `priority`).
  sidebar: {
    items: [
      "docs",
      "docs/getting-started",
      "docs/playground",
      "docs/release",
      "docs/migration/v5",
      { label: "Basic Usage", items: [{ autogenerate: { directory: "docs/usage" } }] },
      { label: "Advanced Usage", items: [{ autogenerate: { directory: "docs/advanced-usage" } }] },
      { label: "Utilities", items: [{ autogenerate: { directory: "docs/utilities" } }] },
      { label: "Runtime", items: [{ autogenerate: { directory: "docs/runtime" } }] },
      { label: "Examples", items: [{ autogenerate: { directory: "docs/examples" } }] },
    ],
  },
});

export default defineConfig({
  output: "static",
  // Tailwind v4 via its Vite plugin (the integration Astro recommends for
  // Tailwind v4 — replaces the PostCSS plugin, which doesn't build under
  // Astro 7's Vite 8 bundler).
  vite: {
    // sveltekitOG(): the package's wasm loader for the server build (Satori's
    // yoga + ReSVG arrive as `?module` imports) and the optional-engine stubs.
    plugins: [tailwindcss(), sveltekitOG()],
  },
  // Hover-prefetch link targets so full-page navigations feel instant without
  // a client-side router.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  integrations: [
    icon(),
    svelte(),
    nimbus(nimbusConfig, {
      // Authoring rules are opt-in by design — your repo, your taste. The
      // two below are the load-bearing pair: frontmatter has to validate
      // against the content schema for the page to render properly, and
      // broken internal links are 404s for your readers. Add the others
      // (heading hierarchy, code-block language, style, etc.) when you're
      // ready to enforce them — see `nimbus-docs lint --help`.
      rules: {
        "nimbus/frontmatter-shape": "error",
        "nimbus/internal-link": "error",
      },
      // Wrap wide tables so they scroll instead of overflowing the page
      // (styled by `.nb-table-scroll` in src/styles/prose.css).
      markdown: {
        hastPlugins: [tableScroll()],
      },
    }),
  ],
});
