<script lang="ts">
	import packageInfo from '$lib/release.json';
	import PackageInstaller from '$lib/components/add-ons/installer-tabs.svelte';
	import SvelteKitOGInstaller from '$lib/components/add-ons/packages/sveltekit-og.md';
	import { Callout } from '@svecodocs/kit';

	const latestVersion = packageInfo.latestVersion;
</script>

<div class="mt-5">
	<div class="sm:flex sm:items-center">
		<div class="sm:flex-auto">
			<div class="flex flex-row items-center justify-between">
				<h2 class="text-base font-semibold text-gray-900 dark:text-white">
					Latest Version: {latestVersion}
				</h2>
				<h1 class="text-base font-semibold text-gray-900 dark:text-white">
					Monthly Downloads: {packageInfo.monthlyDownloads}
				</h1>
			</div>
			<p class="mt-2 text-sm text-gray-700 dark:text-gray-300">
				{new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'long' }).format(
					new Date(packageInfo.time.modified)
				)}
			</p>
		</div>
	</div>

	<div class="flex flex-col mt-8">
		<p>You can install latest version with your favourite package manager and runtime.</p>
		<PackageInstaller component={SvelteKitOGInstaller} />
	</div>

	<Callout class="-mt-10" type="warning" title="Use v4">
		We suggest you to use v4, as older versions are not maintained and developed. v4 only supports
		Svelte v5. We are not planning to support Svelte v4 onwards.
	</Callout>

	<div class="mt-4 flow-root">
		<div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
			<div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
				<div
					class="overflow-hidden shadow-sm outline-1 outline-black/5 sm:rounded-lg dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
				>
					<table class="relative min-w-full divide-y divide-gray-300 dark:divide-white/15">
						<thead class="bg-gray-50 dark:bg-gray-800/75">
							<tr>
								<th
									scope="col"
									class="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6 dark:text-gray-200"
									>Version</th
								>
								<th
									scope="col"
									class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
									>Release Date</th
								>
							</tr>
						</thead>
						<tbody
							class="divide-y divide-gray-200 bg-white dark:divide-white/10 dark:bg-gray-800/50"
						>
							{#each Object.entries(packageInfo.time).reverse() as [version, time] (version)}
								{#if version !== 'created' && version !== 'modified'}
									<tr>
										<td
											class="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6 dark:text-white"
											>v{version}</td
										>
										<td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400"
											>{new Intl.DateTimeFormat('en-US', {
												dateStyle: 'long',
												timeStyle: 'long'
											}).format(new Date(time))}</td
										>
									</tr>
								{/if}
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</div>
