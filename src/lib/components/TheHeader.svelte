<script>
	import ThemeToggle from './ThemeToggle.svelte'
</script>

<div class="flex flex-col mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
	<div class="col-span-12">
		<header class="pt-md-4 pt-8 pb-4 md:pb-4 lg:pt-16 flex justify-between items-center px-2">
			<a href="/">
				<img
					alt="DiceSlice logo"
					src="/diceslice-logo-light.svg"
					class="dark:hidden img-fluid me-1 h-7"
				/>
				<img
					alt="DiceSlice logo"
					src="/diceslice-logo-dark.svg"
					class="hidden dark:block img-fluid me-1 h-7"
				/>
			</a>
			<div>
				<ThemeToggle />
			</div>
		</header>
	</div>
</div>
