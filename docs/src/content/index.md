---
title: Introduction
description: What exactly is Sveltekit OG?
section: Overview
---

<script>
	import { Callout } from '@svecodocs/kit'
</script>

SvelteKit OG is a utility library for generating dynamic Open Graph (OG) images within SvelteKit applications.

Social media platforms (like Twitter, Facebook, and LinkedIn) rely on Open Graph tags to display preview cards when links are shared. SvelteKit OG allows you to define these images using standard HTML/CSS or Svelte components, and renders them into static PNGs on the fly.

It is powered by Satori (Vercel's engine for converting HTML/CSS to SVG) and Resvg (for SVG to PNG conversion). This combination allows for high-performance image generation without the overhead of a headless browser.

## Features

- 🚀 Fast & Lightweight: Unlike Puppeteer or Playwright, sveltekit-og does not launch a browser instance. It runs efficiently in serverless and edge environments (like Vercel Edge or Cloudflare Workers).

- 🎨 Easy Styling: Style your images using standard CSS (Flexbox) or built-in Tailwind CSS support. If you know how to center a div, you know how to design an OG image.

- 🧩 Svelte Component Support: You aren't limited to raw HTML strings. You can import and render actual .svelte components inside your image templates.

- Typography:
  - Support for custom fonts and Google Fonts.
  - Support for Emojis.

- 🛠️ Developer Experience:
  - TypeScript Ready: Fully typed for a better development experience.
  - Debug Mode: Inspect the generated layout bounding boxes to fine-tune your designs.
