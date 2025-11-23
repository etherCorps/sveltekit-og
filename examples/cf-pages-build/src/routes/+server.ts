import { ImageResponse } from '@ethercorps/sveltekit-og';
import type { RequestHandler } from '@sveltejs/kit';
import JetbrainsRegular from "$lib/fonts/JetBrainsMono-Regular.ttf?url"
import { GoogleFont, CustomFont, resolveFonts } from '@ethercorps/sveltekit-og/fonts';
import { read } from '$app/server';

const template = `
 <div class="bg-gray-50 flex flex-col w-full h-full justify-center">
    <div class="flex flex-col w-full justify-between p-8">
      <h2 class="flex flex-col text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 text-left">
        <span>Ready to dive in?</span>
        <span class="text-indigo-600">Start your free trial today.</span>
      </h2>
      <div class="flex flex-row items-start">
        <div class="flex rounded-md shadow">
          <button class="flex justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-3 text-base font-medium text-white">Get started</button>
        </div>
        <div class="ml-3 flex rounded-md shadow">
          <button class="flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-indigo-600">Learn more</button>
        </div>
      </div>
    </div>
  </div>
`;
const jetbrainsMonoBoldURL = 'https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-Bold.ttf'

const fonts = [
	new CustomFont('JetBrains Mono', () => read(JetbrainsRegular).arrayBuffer(), {weight: 400}),
	new GoogleFont('JetBrains Mono', { weight: 500 }),
	new CustomFont('JetBrains Mono', () => fetch(jetbrainsMonoBoldURL).then((res) => res.arrayBuffer()), { weight: 700 }),
];

export const GET: RequestHandler = async () => {
	return new ImageResponse(template, {
		height: 400,
		width: 800,
		debug: false,
		fonts: await resolveFonts(fonts)
	});
};
