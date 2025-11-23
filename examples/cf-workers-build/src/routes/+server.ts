import { ImageResponse } from '@ethercorps/sveltekit-og';
import type { RequestHandler } from '@sveltejs/kit';
import { resolveFonts } from '@ethercorps/sveltekit-og/fonts';
import { fonts } from '../lib/utils/helper.js';

const template = `
 <div class="bg-gray-50 flex w-full h-full items-center justify-center">
    <div class="flex flex-col py-12 px-10 justify-center  w-1/2">
      <h2 class="flex flex-col text-3xl font-bold tracking-tight text-gray-900 text-left">
        <span>Ready to dive in?</span>
        <span class="text-indigo-600 ">Start your free trial today.</span>
      </h2>
      <div class="mt-8 flex md:mt-0">
        <div class="flex rounded-md shadow">
          <button class="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-3 text-base font-medium text-white">Get started</button>
        </div>
        <div class="ml-3 flex rounded-md shadow">
          <button class="flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-indigo-600">Learn more</button>
        </div>
      </div>
    </div>
    <div class="flex w-1/2 items-center justify-center">
        <svg class="h-80 w-80" width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M121.586 37.1263C128.278 41.7525 133.508 48.1942 136.661 55.693C139.814 63.1917 140.76 71.4353 139.385 79.4532C138.011 87.471 134.374 94.9293 128.904 100.95C123.433 106.97 116.356 111.303 108.506 113.436C105.16 114.329 101.612 114.093 98.4128 112.766C95.2136 111.438 92.5411 109.094 90.8091 106.094C89.077 103.095 88.3822 99.6078 88.8318 96.1735C89.2814 92.7392 90.8506 89.5489 93.2964 87.0964L105.417 74.9664C110.495 69.9165 114.437 63.8421 116.983 57.1481C119.528 50.4541 120.616 43.2944 120.176 36.1464C120.616 36.4664 121.106 36.7863 121.586 37.1263Z"
								fill="url(#paint0_linear_8_720)"/>
					<path d="M37.1265 18.3964C41.7558 11.709 48.1987 6.48282 55.6973 3.33272C63.1958 0.182621 71.4381 -0.760388 79.4543 0.614703C87.4706 1.98979 94.9274 5.62576 100.948 11.0948C106.968 16.5639 111.3 23.6385 113.436 31.4864C114.336 34.8347 114.105 38.3861 112.78 41.5899C111.455 44.7938 109.11 47.471 106.109 49.2064C103.108 50.9418 99.6178 51.6384 96.1802 51.1882C92.7426 50.738 89.5497 49.1661 87.0964 46.7164L74.9763 34.5964C69.9168 29.5322 63.8407 25.5989 57.1489 23.0564C50.4572 20.5138 43.3023 19.4197 36.1565 19.8464C36.4665 19.3664 36.7965 18.8764 37.1265 18.3964Z"
								fill="url(#paint1_linear_8_720)"/>
					<path d="M18.3964 102.856C11.709 98.2271 6.48282 91.7842 3.33272 84.2856C0.182621 76.787 -0.760388 68.5448 0.614703 60.5285C1.98979 52.5122 5.62563 45.0554 11.0947 39.0353C16.5637 33.0152 23.6384 28.6823 31.4863 26.5464C34.8381 25.6311 38.3985 25.8506 41.6125 27.1707C44.8265 28.4907 47.5135 30.8371 49.2544 33.844C50.9952 36.8509 51.6922 40.3493 51.2368 43.7938C50.7813 47.2383 49.1989 50.4353 46.7363 52.8864L34.6164 65.0064C32.9555 66.6739 31.4086 68.4512 29.9863 70.3264C22.7321 79.9359 19.1438 91.8179 19.8664 103.836C19.3764 103.516 18.8864 103.196 18.3964 102.856Z"
								fill="url(#paint2_linear_8_720)"/>
					<path d="M102.867 121.586C98.2381 128.277 91.7947 133.506 84.2948 136.658C76.7949 139.81 68.5506 140.754 60.5323 139.379C52.514 138.003 45.0554 134.366 39.0345 128.895C33.0136 123.424 28.681 116.347 26.5465 108.496C25.6366 105.145 25.86 101.586 27.1822 98.3743C28.5044 95.1627 30.851 92.4782 33.857 90.7385C36.863 88.9988 40.3599 88.3015 43.8033 88.755C47.2467 89.2086 50.4436 90.7876 52.8966 93.2464L65.0164 105.366C66.6766 107.035 68.4546 108.583 70.3365 109.996C79.9401 117.255 91.8206 120.844 103.837 120.116C103.527 120.606 103.197 121.106 102.867 121.586Z"
								fill="url(#paint3_linear_8_720)"/>
					<defs>
							<linearGradient id="paint0_linear_8_720" x1="88.6985" y1="75.0572" x2="139.999" y2="75.0572"
															gradientUnits="userSpaceOnUse">
									<stop stop-color="#4f39f6"/>
									<stop offset="1" stop-color="oklch(67.3% 0.182 276.935)"/>
							</linearGradient>
							<linearGradient id="paint1_linear_8_720" x1="36.1565" y1="25.6608" x2="113.975" y2="25.6608"
															gradientUnits="userSpaceOnUse">
									<stop stop-color="#4f39f6"/>
									<stop offset="1" stop-color="oklch(67.3% 0.182 276.935)"/>
							</linearGradient>
							<linearGradient id="paint2_linear_8_720" x1="0" y1="64.9134" x2="51.3726" y2="64.9134"
															gradientUnits="userSpaceOnUse">
									<stop stop-color="#4f39f6"/>
									<stop offset="1" stop-color="oklch(67.3% 0.182 276.935)"/>
							</linearGradient>
							<linearGradient id="paint3_linear_8_720" x1="25.9963" y1="114.307" x2="103.837" y2="114.307"
															gradientUnits="userSpaceOnUse">
									<stop stop-color="#4f39f6"/>
									<stop offset="1" stop-color="oklch(67.3% 0.182 276.935)"/>
							</linearGradient>
					</defs>
			</svg>
    </div>
  </div>
`;

export const GET: RequestHandler = async ({fetch}) => {
	return new ImageResponse(template, {
		height: 600,
		width: 1200,
		debug: false,
		fonts: await resolveFonts(fonts)
	});
};
