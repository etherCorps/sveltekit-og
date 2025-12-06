import { getAllDocs, getDoc } from '$lib/utils';
import type { EntryGenerator } from './$types';

export const prerender = true;

export const entries: EntryGenerator = async () => {
	return getAllDocs().map((doc) => ({
		slug: `${doc.slug}`
	}));
};

export async function load({ params }) {
	return getDoc(params.slug);
}
