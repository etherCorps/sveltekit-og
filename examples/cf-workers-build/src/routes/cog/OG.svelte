<script>
	let { text, spanText } = $props();
</script>

<div class="bg-gray-50 flex w-full h-full items-center justify-center">
	<div class="flex flex-col w-full py-12 px-4  p-8">
		<h2 class="flex flex-col text-3xl sm:text-4xl tracking-tight text-gray-900 text-left">
			<span class="font-bold">{text}</span>
			<span class="text-indigo-600 font-normal mt-4">{spanText}</span>
		</h2>
		<div class="mt-8 flex md:mt-0">
			<div class="flex rounded-md shadow">
				<button
					class="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-3 text-base font-medium text-white"
					>Get started</button
				>
			</div>
			<div class="ml-3 flex rounded-md shadow">
				<button
					class="flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-indigo-600"
					>Learn more</button
				>
			</div>
		</div>
	</div>
</div>
