import { GoogleFont, CustomFont } from '@ethercorps/sveltekit-og/fonts';

const jetbrainsMonoBoldURL = 'https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-Bold.ttf'

export const fonts = [
	new GoogleFont('JetBrains Mono', { weight: 500 }),
	new GoogleFont('JetBrains Mono', { weight: 400 }),
	new CustomFont('JetBrains Mono', () => fetch(jetbrainsMonoBoldURL).then((res) => res.arrayBuffer()), { weight: 700 }),
];