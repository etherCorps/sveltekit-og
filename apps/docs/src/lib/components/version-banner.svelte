<script lang="ts">
	// Shown on every v4 page: this is the previous major, with a pointer to the v5 page.
	let { canonical }: { canonical: string } = $props();
</script>

<div
	class="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
	role="note"
>
	<strong>You're reading the v4 docs.</strong>
	<span>
		v4 receives security and critical fixes until six months after the 5.0.0 release.
		<a class="font-medium underline" href={canonical}>Read this page in the v5 docs →</a>
	</span>
</div>
