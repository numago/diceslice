<script>
	import '../app.css'
	import BrowserStatus from '$lib/components/BrowserStatus.svelte'
	import TheFooter from '$lib/components/TheFooter.svelte'
	import TheHeader from '$lib/components/TheHeader.svelte'
</script>

<div class="bg-gray-50 dark:bg-slate-900 min-h-screen">
	<div class="flex px-2">
		<BrowserStatus />
	</div>
	<TheHeader />
	<main>
		<slot />
	</main>
	<TheFooter />
</div>
