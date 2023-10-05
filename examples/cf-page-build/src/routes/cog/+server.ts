import OG from './OG.svelte';
import type { RequestHandler } from '@sveltejs/kit';
import { componentToImageResponse } from '@ethercorps/sveltekit-og';

export const GET: RequestHandler = async () => {
	return componentToImageResponse(
		OG,
		{ text: 'Ready to dive in?', spanText: 'Start your free trial today.' }
	);
};
