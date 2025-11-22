<svelte:options css="injected" />
<script lang="ts">
	import Star from "phosphor-svelte/lib/Star";
	import Contributors from "phosphor-svelte/lib/Users";
	import Fork from "phosphor-svelte/lib/GitFork";
	import SealWarning from "phosphor-svelte/lib/SealWarning";
	import GithubLogo from "phosphor-svelte/lib/GithubLogo";

	type Props = {
		logo: string;
		owner: string;
		repo: string;
		description: string;
		contributors: number;
		open_issues: number;
		stars: number;
		forks: number;
	}

	const {open_issues, owner, forks, repo, stars, description, contributors, logo}: Props = $props();

	const details = [
		{
			title: 'Contributors',
			count: contributors,
			icon: Contributors,},
		{
			title: 'Stars',
			count: stars,
			icon: Star},
		{
			title: 'Fork',
			count: forks,
			icon: Fork},
		{
			title: 'Issues',
			count: open_issues,
			icon: SealWarning}
	]
</script>

<div class="flex flex-col w-full h-full bg-white">
	<div class="flex flex-col w-full h-[96%] px-16 pt-20 pb-10">
		<div class="flex flex-row items-center justify-between w-full h-1/2">
			<div class="flex flex-col w-1/2 items-start">
				<span class="text-gray-800 text-7xl leading-1.5">{owner}/</span>
				<span class="text-7xl font-bold">{repo}</span>
			</div>
			<img class="h-full" src={logo}>
		</div>
		<div class="flex flex-row w-[55%] mt-2">
			<span class="text-xl text-gray-600 leading-1.5 tracking-wide">{description}</span>
		</div>
		<div class="flex flex-row items-center justify-between w-full h-1/2">
			{#each details as detail (detail.title)}
				<div class="flex flex-row">
					<detail.icon class="w-8 h-8"/>
					<div class="flex flex-col ml-2">
						<span class="text-gray-900 text-2xl">{detail.count}</span>
						<span class="text-gray-600 text-xl">{detail.title}</span>
					</div>
				</div>
			{/each}
			<div class="flex flex-row border-2 border-[#57bfbb] p-3 rounded-full">
				<GithubLogo class="w-8 h-8" color="#57bfbb"/>
			</div>
		</div>
	</div>
	<div class="flex flex-row w-full h-7">
		<span class="flex bg-[#3178c6] w-9/12"></span>
		<span class="flex bg-[#f1e05b] w-2/12"></span>
		<span class="flex bg-[#ff3e00] w-1/12"></span>
	</div>
</div>