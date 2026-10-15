import type { APIRoute } from "astro";
import { createImage } from "@ethercorps/sveltekit-og";

// Demo image embedded by /docs/usage/html: an HTML string rendered at build.
const html = `
<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; height: 100%; background-color: #101011;">
	<h1 style="color: gray; font-size: 80px; margin: 0;">@ethercorps/sveltekit-og</h1>
	<p style="color: gray; font-size: 36px; margin-top: 20px;">Your Raw HTML Open Graph Image!</p>
</div>`;

export const prerender = true;
export const GET: APIRoute = () => createImage(html, { width: 1200, height: 630 });
