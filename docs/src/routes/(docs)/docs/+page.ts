import { getDoc } from '$lib/utils';

export const prerender= true

export async function load() {
	return getDoc();
}
