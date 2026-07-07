---
title: Introduction
description: What exactly is Sveltekit OG?
section: Overview
---

<script>
	import { Callout } from '@svecodocs/kit'
</script>

**SvelteKit OG** is a high-performance utility library designed for **server-side image generation** within SvelteKit applications.

While its primary use is creating **dynamic Open Graph (OG) images** for rich social media preview cards, the library is a generic tool capable of converting Svelte components or HTML/CSS into high-quality PNGs, suitable for a wide range of use cases .

It allows you to define a single visual template using modern web technologies and render unique, personalized images on the fly based on dynamic data or URL parameters.

## Zero-Browser Rendering

SvelteKit OG achieves its speed and efficiency by relying on two core technologies, entirely avoiding the performance cost of launching a headless browser like Puppeteer:

1.  **Satori (Vercel):** This engine takes your standard HTML and CSS (Flexbox, Tailwind) and converts it into an **SVG** representation.
2.  **Resvg:** This powerful Rust-based library then takes the generated SVG and converts it into the final **PNG** or JPEG image file that is served to the client.

This combination ensures the library runs efficiently in **serverless** and **edge environments** (like Vercel Edge, Cloudflare Workers, or Netlify functions).

## Key Features & Benefits

- 🚀 Fast & Lightweight: Unlike Puppeteer or Playwright, sveltekit-og does not launch a browser instance. It runs efficiently in serverless and edge environments (like Vercel Edge or Cloudflare Workers).

- 🎨 Easy Styling: Style your images using standard CSS (Flexbox) or built-in Tailwind CSS support. If you know how to center a div, you know how to design an OG image.

- 🧩 Svelte Component Support: You aren't limited to raw HTML strings. You can import and render actual .svelte components inside your image templates.

- Typography:
  - Support for custom fonts and Google Fonts.
  - Support for Emojis.

- 🛠️ Developer Experience:
  - TypeScript Ready: Fully typed for a better development experience.
  - Debug Mode: Inspect the generated layout bounding boxes to fine-tune your designs.
