import { ImageResponse } from '@ethercorps/sveltekit-og';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const html = `
    <div tw="flex w-full h-full bg-white items-center justify-center">
      <div tw="flex flex-col items-center justify-center">
        <h1 tw="text-6xl font-bold text-gray-900">Hello SvelteKit OG!</h1>
        <p tw="text-2xl text-gray-500 mt-4">Dynamic images made easy</p>
      </div>
    </div>
  `;

	return new ImageResponse(html, {
		width: 1200,
		height: 630,
	});
};