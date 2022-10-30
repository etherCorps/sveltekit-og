<script>
	export let text;
	export let spanText;
</script>

<div tw="bg-gray-50 flex w-full h-full items-center justify-center">
	<div tw="flex flex-col md:flex-row w-full py-12 px-4 md:items-center justify-between p-8">
		<h2 tw="flex flex-col text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 text-left">
			<span>{text}</span>
			<span tw="text-indigo-600">{spanText}</span>
		</h2>
		<div tw="mt-8 flex md:mt-0">
			<div tw="flex rounded-md shadow">
				<a
					href="#"
					tw="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-3 text-base font-medium text-white"
					>Get started</a
				>
			</div>
			<div tw="ml-3 flex rounded-md shadow">
				<a
					href="#"
					tw="flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-indigo-600"
					>Learn more</a
				>
			</div>
		</div>
	</div>
</div>
