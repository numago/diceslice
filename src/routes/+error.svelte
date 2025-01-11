<script>
	import { base } from '$app/paths'
	import { page } from '$app/stores'
</script>

<div class="my-20 text-gray-800 dark:text-slate-300 block text-center">
	<h1 class="text-9xl">
		{$page.status}
	</h1>
	<p class="text-3xl">
		{$page.error?.message}
	</p>
	<a href={base} class="underline my-5 block">Go back to the home page</a>
</div>
