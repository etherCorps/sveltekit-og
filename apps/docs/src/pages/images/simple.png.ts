import type { APIRoute } from "astro";
import { createImage } from "@ethercorps/sveltekit-og";
import SimpleCard from "@/components/og/simple.svelte";

// Demo image embedded by /docs/usage/svelte: a Svelte component rendered at build.
export const prerender = true;
export const GET: APIRoute = () => createImage(SimpleCard, { width: 1200, height: 630 });
