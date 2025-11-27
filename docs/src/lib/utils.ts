import { docs, type Doc } from '$content/index.js';
import { error } from '@sveltejs/kit';
import type { Component } from 'svelte';

export function getDocMetadata(slug: string | 'index' = 'index') {
	return docs.find((doc) => doc.slug === slug);
}

export function getAllDocs() {
	return docs;
}

function slugFromPath(path: string) {
	return path.replace('/src/content/', '').replace('.md', '');
}

export type DocResolver = () => Promise<{ default: Component; metadata: Doc }>;

export async function getDoc(slug: string | 'index' = 'index') {
	const modules = import.meta.glob('/src/content/**/*.md');

	let match: { path?: string; resolver?: DocResolver } = {};

	for (const [path, resolver] of Object.entries(modules)) {
		if (slugFromPath(path) === slug) {
			match = { path, resolver: resolver as unknown as DocResolver };
			break;
		}
	}
	const doc = await match?.resolver?.();
	const metadata = getDocMetadata(slug);
	if (!doc || !metadata) {
		error(404, 'Could not find the document.');
	}

	return {
		component: doc.default,
		metadata
	};
}

function titleLocaleCompare(a: string, b: string) {
	return a.localeCompare(b);
}

const sortDocs = (a: Doc, b: Doc) => {
	const aHasPriority = a.priority != null;
	const bHasPriority = b.priority != null;

	if (a?.priority && b?.priority) {
		const priorityComparison = a.priority! - b.priority!;
		if (priorityComparison !== 0) {
			return priorityComparison;
		}
		return titleLocaleCompare(a.title, b.title);
	}

	if (aHasPriority) {
		return -1;
	}

	if (bHasPriority) {
		return 1;
	}

	return titleLocaleCompare(a.title, b.title);
};

export function getSectionItems (sectionName: Doc['section'], doSort = true): Record<'title' | 'href', string>[] {
	let items = getAllDocs()
		.filter((doc) => doc.section === sectionName);

	if (doSort) {
		items = items.sort(sortDocs);
	}

	// Map the filtered/sorted documents to the navigation item structure
	return items.map((doc) => ({
		title: doc.navLabel || doc.title,
		href: `/docs/${doc.slug}`
	}));
}
