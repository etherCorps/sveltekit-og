import { ImageResponse, type TakumiImageResponseOptions } from '@ethercorps/sveltekit-og/takumi';
import type { RequestHandler } from '@sveltejs/kit';

// Takumi reads inline `style`/`tw`, not Tailwind `class`, and ships a built-in
// sans-serif so no font fetch is needed for this default template.
const template = `
	<div style="display:flex;width:100%;height:100%;align-items:center;justify-content:center;background:#f9fafb">
		<div style="display:flex;flex-direction:column;padding:48px">
			<div style="font-size:56px;font-weight:700;color:#111827">Ready to dive in?</div>
			<div style="font-size:56px;font-weight:700;color:#4f39f6">Rendered with Takumi.</div>
		</div>
	</div>
`;

export const GET: RequestHandler = async ({ url }) => {
	const format = (url.searchParams.get('format') as TakumiImageResponseOptions['format']) || 'png';
	return new ImageResponse(template, { width: 1200, height: 630, format });
};
