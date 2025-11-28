<script lang="ts">
	import { Button, Label, Input } from '@svecodocs/kit';

	let githubDetails = $state({
		owner: 'sveltejs',
		repo: 'kit'
	});

	let imageSrc = $state(`/images/github?owner=sveltejs&repo=kit`);

	function newOg() {
		imageSrc = `/images/github?owner=${githubDetails.owner}&repo=${githubDetails.repo}`;
	}
</script>

<div class="flex flex-row items-center gap-x-5 w-full">
	<div class="flex flex-col gap-y-3 w-full">
		<Label>Github Username</Label>
		<Input bind:value={githubDetails.owner} />
	</div>
	<div class="flex flex-col gap-y-3 w-full">
		<Label>User Repository</Label>
		<Input bind:value={githubDetails.repo} />
	</div>
	<div class="flex flex-col gap-y-3 w-full">
		<Label class="truncate">Create for @{githubDetails.owner}/{githubDetails.repo}</Label>
		<Button onclick={newOg} class="w-full">Generate</Button>
	</div>
</div>

<div class="flex flex-col">
	<img class="rounded-lg" src={imageSrc} alt="Playground" />
	<span class="mt-2"
		>Preview link:
		<a
			class="italic text-rose-400"
			target="_blank"
			rel="noreferrer"
			referrerpolicy="no-referrer"
			href={imageSrc}>{imageSrc}</a
		></span
	>
</div>
