<script lang="ts">
	import { scale } from 'svelte/transition'
	import { scrollIntoView } from './ScrollIntoViewAction'

	export let title = 'Error'
</script>

<div
	use:scrollIntoView
	transition:scale={{ duration: 300 }}
	class="border border-red-200 bg-red-50 dark:border-red-400 dark:bg-slate-700 p-4 rounded-md my-3"
>
	<div class="flex">
		<div class="flex-shrink-0 text-red-600 dark:text-red-400">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				data-slot="icon"
				class="w-6 h-6"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
				/>
			</svg>
		</div>
		<div class="ml-3">
			<h3 class="text-md font-medium text-red-600 dark:text-red-400">{title}</h3>
			<p class="mt-2 text-sm text-gray-700 dark:text-slate-100">
				<slot />
			</p>
		</div>
	</div>
</div>
