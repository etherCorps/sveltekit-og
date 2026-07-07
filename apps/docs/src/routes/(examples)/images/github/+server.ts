import { ImageResponse } from '@ethercorps/sveltekit-og';
import { error, type RequestHandler } from '@sveltejs/kit';
import {
	getRepoDetails,
	type RepoDetailsError,
	type RepoDetailsResponse,
	cache,
	type RepoContributorsResponse
} from './api.js';
import { tryCatch } from '$lib/try-catch';
import type { ImageResponseOptions } from '@ethercorps/sveltekit-og';
import OgComponent from '$lib/components/og/github-repo.svelte';
import { fontsData } from '$lib/fonts-utils.js';
import type { ComponentProps } from 'svelte';

export const GET: RequestHandler = async ({ url }) => {
	const details = {
		owner: url.searchParams.get('owner') ?? 'etherCorps',
		repo: url.searchParams.get('repo') ?? 'sveltekit-og'
	};

	const cacheKey = `${details.owner}/${details.repo}`;
	let data = cache.get(cacheKey);

	if (!data) {
		const { data: response, error: githubError } = await tryCatch<
			{ repo: RepoDetailsResponse; contributors: RepoContributorsResponse },
			RepoDetailsError
		>(getRepoDetails(details));
		if (githubError) {
			error(githubError?.response?.data?.status || 500, {
				message: githubError?.response?.data?.message
			});
		}
		if (response && response.repo.data) {
			data = { ...response.repo.data, contributors_count: response.contributors.data.length };
			cache.set(`${details.owner}/${details.repo}`, data);
		}
	}

	const props: ComponentProps<typeof OgComponent> = {
		owner: data?.owner.login as string,
		repo: data?.name as string,
		description: String(data?.description),
		contributors: data?.contributors_count as number,
		forks: data?.forks as number,
		open_issues: data?.open_issues as number,
		stars: data?.stargazers_count as number,
		logo: data?.owner.avatar_url as string
	};

	const imageOptions: ImageResponseOptions = {
		width: 1200,
		height: 630,
		debug: false,
		fonts: await fontsData(),
		headers: {
			'Cache-Control': 'no-cache, no-store'
		}
	};

	return new ImageResponse(OgComponent, imageOptions, props);
};
