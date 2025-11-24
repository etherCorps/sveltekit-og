import { Octokit } from 'octokit';

export const cache = new Map<
	string,
	RepoDetailsResponse['data'] & { contributors_count: number }
>();

export type RequestDetailsParams = {
	repo: string;
	owner: string;
};

const octokit = new Octokit();

export type RepoDetailsResponse = Awaited<ReturnType<typeof getRepoDetails>>['repo'];
export type RepoContributorsResponse = Awaited<ReturnType<typeof getRepoDetails>>['contributors'];

export type RepoDetailsError = {
	response: {
		data: {
			status: number;
			message: string;
		};
	};
} | null;

export async function getRepoDetails(details: Required<RequestDetailsParams>) {
	const repoRequest = octokit.request(`GET /repos/{owner}/{repo}`, {
		owner: details.owner,
		repo: details.repo,
		headers: {
			'X-GitHub-Api-Version': '2022-11-28'
		}
	});

	const repoContributors = octokit.request(`GET /repos/{owner}/{repo}/contributors`, {
		owner: details.owner,
		repo: details.repo,
		headers: {
			'X-GitHub-Api-Version': '2022-11-28'
		}
	});

	const [repo, contributors] = await Promise.all([repoRequest, repoContributors]);

	return {
		repo,
		contributors
	};
}
