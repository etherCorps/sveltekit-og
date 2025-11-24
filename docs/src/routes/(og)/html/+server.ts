import { ImageResponse, type ImageResponseOptions } from '@ethercorps/sveltekit-og';
import { error, type RequestHandler } from '@sveltejs/kit';
import {
	getRepoDetails,
	type RepoDetailsError,
	type RepoDetailsResponse,
	cache,
	type RepoContributorsResponse
} from '../(github)/api';
import { tryCatch } from '$lib/try-catch';
import ogHTML from './og.html?raw';
import { fontsData } from '../(helpers)/fonts';

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

	const replaceHolder = {
		'{owner}': data?.owner.login,
		'{repo}': data?.name,
		'{description}': data?.description,
		'{logo}': data?.owner?.avatar_url,
		'{contributors}': data?.contributors_count,
		'{forks}': data?.forks,
		'{open_issues}': data?.open_issues,
		'{stars}': data?.stargazers_count
	};

	let htmlToRender = ogHTML;

	for (const [key, value] of Object.entries(replaceHolder)) {
		htmlToRender = htmlToRender.replaceAll(key, String(value) || 'undefined');
	}

	const imageOptions: ImageResponseOptions = {
		width: 1200,
		height: 630,
		debug: false,
		fonts: await fontsData(),
		headers: {
			'Cache-Control': 'no-cache, no-store'
		}
	};

	return new ImageResponse(htmlToRender, imageOptions);
};
