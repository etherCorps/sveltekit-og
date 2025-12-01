import type { SidebarNavItem, AnchorNavItem, SidebarNavSection } from '@svecodocs/kit';
import ChalkboardTeacher from 'phosphor-svelte/lib/ChalkboardTeacher';
import RocketLaunch from 'phosphor-svelte/lib/RocketLaunch';
import { defineNavigation } from '@svecodocs/kit';
import { getSectionItems } from './utils.js';
import Tag from 'phosphor-svelte/lib/Tag';

const runtime = getSectionItems("Runtime");

const usage = getSectionItems("Usage");

const utilities = getSectionItems("Utilities");

const examples = getSectionItems("Examples");

const advancedUsage = getSectionItems("Advanced Usage");

export const navigation = defineNavigation({
	anchors: [
		{
			title: 'Introduction',
			description: "What exactly is Sveltekit OG?",
			href: '/docs',
			icon: ChalkboardTeacher
		},
		{
			title: 'Getting Started',
			href: '/docs/getting-started',
			description: "A quick guide to get started using Sveltekit OG",
			icon: RocketLaunch
		},
		{
			title: 'Releases',
			description: "Sveltekit OG package release history and latest version",
			href: '/docs/release',
			icon: Tag
		}
	],
	sections: [
		{
			title: 'Basic Usage',
			items: usage
		},
		{
			title: 'Advanced Usage',
			items: advancedUsage
		},
		{
			title: 'Utilities',
			items: utilities
		},
		{
			title: 'Runtime',
			items: runtime
		},
		{
			title: 'Examples',
			items: examples
		}
	]
});

interface Neighbor {
	title: string;
	href: string;
}

interface NavigationNeighbors {
	previous: Neighbor | null;
	next: Neighbor | null;
}

export function flatNavigationItems(): Neighbor[] {
	const flatNav: Neighbor[] = [];

	const anchors = navigation?.anchors || [];
	const sections = navigation?.sections || [];

	flatNav.push(...anchors.filter(anchor => !anchor.disabled));

	for (const section of sections) {
		if (section && section.items.length > 0) {
			const internalItems = section.items.filter(item => !item.external);
			flatNav.push(...internalItems as Required<SidebarNavItem>[]);
		}
	}

	return flatNav;
}

const flatNavs = flatNavigationItems();

export function getNavigationNeighbors(currentHref: string): NavigationNeighbors {
	const currentIndex = flatNavs.findIndex(item => item.href === currentHref);

	if (currentIndex === -1) {
		return { previous: null, next: null };
	}

	const previous = currentIndex > 0 ? flatNavs[currentIndex - 1] : null;
	const next = currentIndex < flatNavs.length - 1 ? flatNavs[currentIndex + 1] : null;

	return { previous, next };
}