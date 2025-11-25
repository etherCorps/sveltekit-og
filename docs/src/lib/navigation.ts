import { defineNavigation } from '@svecodocs/kit';
import ChalkboardTeacher from 'phosphor-svelte/lib/ChalkboardTeacher';
import RocketLaunch from 'phosphor-svelte/lib/RocketLaunch';
import Tag from 'phosphor-svelte/lib/Tag';
import { getAllDocs } from './utils.js';

const allDocs = getAllDocs();

const runtime = allDocs
	.filter((doc) => doc.section === 'Runtime')
	.map((doc) => ({
		title: doc.title,
		href: `/docs/${doc.slug}`
	}));

const usage = allDocs
	.filter((doc) => doc.section === 'Usage')
	.map((doc) => ({
		title: doc.title,
		href: `/docs/${doc.slug}`
	}));

const utilities = allDocs
	.filter((doc) => doc.section === 'Utilities')
	.map((doc) => ({
		title: doc.title,
		href: `/docs/${doc.slug}`
	}))
	.reverse();

export const navigation = defineNavigation({
	anchors: [
		{
			title: 'Introduction',
			href: '/docs',
			icon: ChalkboardTeacher
		},
		{
			title: 'Getting Started',
			href: '/docs/getting-started',
			icon: RocketLaunch
		},
		{
			title: 'Releases',
			// href: "https://www.npmjs.com/package/@ethercorps/sveltekit-og?activeTab=versions",
			href: '/docs/release',
			icon: Tag
		}
	],
	sections: [
		{
			title: 'Usage',
			items: usage
		},
		{
			title: 'Runtime',
			items: runtime
		},
		{
			title: 'Utilities',
			items: utilities
		}
	]
});
