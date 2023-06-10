<script>
	let menuBar = false;
</script>

<!-- navbar goes here -->
<nav class="bg-gray-100">
	<div class="max-w-full mx-auto px-4">
		<div class="flex justify-between">
			<div class="flex space-x-4">
				<!-- logo -->
				<div>
					<a
						href="#"
						class="flex items-center py-5 px-2 text-gray-700 hover:text-gray-900 space-x-3"
					>
						<svg viewBox="0 0 75 65" fill="black" class="w-4 h-4 rotate-90">
							<path d="M37.59.25l36.95 64H.64l36.95-64z" />
						</svg>
						<span class="font-bold">Sveltekit-OG</span>
					</a>
				</div>
			</div>

			<!-- secondary nav -->
			<div class="hidden md:flex items-center space-x-1">
				<a
					href="https://github.com/etherCorps/sveltekit-og/#readme"
					target="_blank"
					rel="noreferrer"
					class="py-5 px-3 underline">Docs</a
				>
				<a
					href="https://github.com/etherCorps/sveltekit-og"
					target="_blank"
					rel="noreferrer"
					class="py-5 px-3 underline">Github</a
				>
			</div>

			<!-- mobile button goes here -->
			<div class="md:hidden flex items-center">
				<button
					class="mobile-menu-button"
					on:click={() => {
						menuBar = !menuBar;
					}}
				>
					<svg
						class="w-6 h-6"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>
			</div>
		</div>
	</div>

	<!-- mobile menu -->
	<div class="mobile-menu {menuBar ? '' : 'hidden'} md:hidden">
		<a href="#" class="block py-2 px-4 text-sm hover:bg-gray-200">Docs</a>
		<a href="#" class="block py-2 px-4 text-sm hover:bg-gray-200">Github</a>
	</div>
</nav>
