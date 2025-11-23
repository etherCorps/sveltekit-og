import { GoogleFont, CustomFont } from '@ethercorps/sveltekit-og/fonts';
import { read } from '$app/server';
import JetbrainsRegular from "./JetBrainsMono-Regular.ttf"

const jetbrainsMonoBoldURL = 'https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-Bold.ttf'

export const fonts = [
	new CustomFont('JetBrains Mono', () => read(JetbrainsRegular).arrayBuffer(), {weight: 400}),
	new GoogleFont('JetBrains Mono', { weight: 500 }),
	new CustomFont('JetBrains Mono', () => fetch(jetbrainsMonoBoldURL).then((res) => res.arrayBuffer()), { weight: 700 }),
];