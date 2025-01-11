<script lang="ts">
	import { scale } from 'svelte/transition'
	import { scrollIntoView } from './ScrollIntoViewAction'

	export let title = 'Warning'

	type Button = {
		label: string
		action: () => void
	}
	export let buttons: Button[] = []
</script>

<div
	use:scrollIntoView
	transition:scale={{ duration: 300 }}
	class="border border-orange-200 bg-orange-50 dark:border-orange-400 dark:bg-slate-700 p-4 rounded-md my-3"
>
	<div class="flex">
		<div class="flex-shrink-0 text-orange-600 dark:text-orange-400">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="w-6 h-6"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
				/>
			</svg>
		</div>
		<div class="ml-3">
			<h3 class="text-md font-medium text-orange-600 dark:text-orange-400">{title}</h3>
			<p class="mt-2 text-sm text-gray-800 dark:text-slate-100">
				<slot name="text" />
			</p>
			<div class="mt-3">
				{#each buttons as { label, action }}
					<button
						type="button"
						on:click={action}
						class="rounded bg-orange-100 text-gray-800 hover:bg-orange-200 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-900 px-2.5 py-1.5 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
					>
						{label}
					</button>
				{/each}
			</div>
		</div>
	</div>
</div>
