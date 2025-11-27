import { defineNavigation } from '@svecodocs/kit';
import ChalkboardTeacher from 'phosphor-svelte/lib/ChalkboardTeacher';
import RocketLaunch from 'phosphor-svelte/lib/RocketLaunch';
import Tag from 'phosphor-svelte/lib/Tag';
import { getAllDocs, getSectionItems } from './utils.js';

const allDocs = getAllDocs();

const runtime = getSectionItems("Runtime");

const usage = getSectionItems("Usage");

const utilities = getSectionItems("Utilities");

const advancedUsage = getSectionItems("Examples");

const types = getSectionItems("Types");

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
		},
		{
			title: 'Examples',
			items: advancedUsage
		}
	]
});
