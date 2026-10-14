<!-- Test fixture: `css="injected"` with a multi-line CSS value. Satori's value parser
     rejects newlines inside e.g. linear-gradient(...), so the injected <style> must be
     whitespace-normalized before it reaches satori — the same way HTML strings are. -->
<svelte:options css="injected" />

<div class="bg-gradient" style="display:flex;width:100%;height:100%;align-items:center;justify-content:center">
	<span style="font-size:48px;color:#fff">Injected styles</span>
</div>

<style>
	.bg-gradient {
		background: linear-gradient(
			to right,
			#3730a3,
			#4f46e5
		);
	}
</style>
