import { ImageResponse } from '@ethercorps/sveltekit-og';
import type { RequestHandler } from '@sveltejs/kit';

// This is optional, use it if you want to generate OG image at build time.
export const prerender = true;

// The static HTML content
const htmlString = `
<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; height: 100%; background-color: #101011;">
	<h1 style="color: gray; font-size: 80px; margin: 0;">@ethercorps/sveltekit-og</h1>
	<p style="color: gray; font-size: 36px; margin-top: 20px;">Your Raw HTML Open Graph Image!</p>
</div>
`;

export const GET: RequestHandler = async () => {
	return new ImageResponse(
		htmlString, // ⬅️ Pass the HTML string here
		{
			width: 1200,
			height: 630,
		}
	);
};