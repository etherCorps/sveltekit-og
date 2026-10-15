import type { APIRoute } from "astro";
import { readFileSync } from "node:fs";
import { createImage, CustomFont } from "@ethercorps/sveltekit-og";
import GithubRepo from "@/components/og/github-repo.svelte";

// The GitHub-card example (/docs/examples/github-repo-og), rendered at build for this
// repo. Unauthenticated GitHub API; falls back to fixed numbers when rate-limited so
// the build never depends on it.
export const prerender = true;

const font = (file: string, weight: number) =>
	new CustomFont("Neon", readFileSync(new URL(`../../../public/fonts-static/${file}`, import.meta.url)), { weight });
const fonts = [font("SpaceMono-Regular.ttf", 400), font("SpaceMono-Bold.ttf", 700)];

const OWNER = "etherCorps";
const REPO = "sveltekit-og";

async function repoDetails() {
	const fallback = {
		owner: OWNER,
		repo: REPO,
		description: "Open Graph image generation for SvelteKit — Takumi or Satori, server, edge or browser.",
		contributors: 6,
		open_issues: 0,
		stars: 300,
		forks: 20,
		logo: "https://avatars.githubusercontent.com/u/98826560?s=200&v=4",
	};
	try {
		const headers = { "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "sveltekit-og-docs" };
		const [repo, contributors] = await Promise.all([
			fetch(`https://api.github.com/repos/${OWNER}/${REPO}`, { headers }).then((r) => (r.ok ? r.json() : null)),
			fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contributors?per_page=100`, { headers }).then((r) => (r.ok ? r.json() : null)),
		]);
		if (!repo) return fallback;
		return {
			owner: repo.owner.login as string,
			repo: repo.name as string,
			description: String(repo.description ?? fallback.description),
			contributors: Array.isArray(contributors) ? contributors.length : fallback.contributors,
			open_issues: repo.open_issues as number,
			stars: repo.stargazers_count as number,
			forks: repo.forks as number,
			logo: repo.owner.avatar_url as string,
		};
	} catch {
		return fallback;
	}
}

export const GET: APIRoute = async () =>
	createImage(GithubRepo, { width: 1200, height: 630, fonts }, await repoDetails());
