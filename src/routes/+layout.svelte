<script>
	import '../app.css';
	import Navbar from '../components/Navbar.svelte';

	import { onMount } from 'svelte'
	import { partytownSnippet } from '@builder.io/partytown/integration'

	// Add the Partytown script to the DOM head
	let scriptEl
	onMount(
			() => {
				if (scriptEl) {
					scriptEl.textContent = partytownSnippet()
				}
			}
	)

</script>

<svelte:head>
	<!-- Config options -->
	<script>
		// Forward the necessary functions to the web worker layer
		partytown = {
			forward: ['dataLayer.push'],
			resolveUrl: (url) => {
				const siteUrl = 'https://sveltekit-og.ethercorps.io/proxytown';

				if (url.hostname === 'www.googletagmanager.com') {
					const proxyUrl = new URL(`${siteUrl}/gtm`)

					const gtmId = new URL(url).searchParams.get('id')
					gtmId && proxyUrl.searchParams.append('id', gtmId)

					return proxyUrl
				} else if (url.hostname === 'www.google-analytics.com') {
					const proxyUrl = new URL(`${siteUrl}/ga`)

					return proxyUrl
				}

				return url
			}
		}
	</script>


	<!-- `partytownSnippet` is inserted here -->
	<script bind:this={scriptEl}></script>

	<script
			type="text/partytown"
			src="https://www.googletagmanager.com/gtag/js?id=G-RQGCXL5D07"></script>
	<script type="text/partytown">
		window.dataLayer = window.dataLayer || []

		function gtag() {
			dataLayer.push(arguments)
		}

		gtag('js', new Date())
		gtag('config', 'G-RQGCXL5D07', {
			page_path: window.location.pathname
		})
	</script>
</svelte:head>

<div class="max-h-screen">
	<Navbar />
	<slot />
</div>
