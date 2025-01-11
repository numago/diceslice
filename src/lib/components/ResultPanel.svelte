<script lang="ts">
	import { scrollIntoView } from './ScrollIntoViewAction'
	import { scale } from 'svelte/transition'

	export let title: string
</script>

<output>
	<div
		use:scrollIntoView
		transition:scale={{ duration: 300 }}
		class="rounded-md bg-gray-50 dark:bg-slate-700 outline outline-2 outline-gray-200 dark:outline-0 shadow-lg p-4 mt-8"
	>
		<div>
			<h3
				class="inline-flex items-center gap-x-1 text-xl my-0 pb-0 pt-2 font-semibold tracking-normal text-gray-900 dark:text-slate-100"
			>
				<span class="h-7 w-7 text-green-600 dark:text-green-500 inline">
					<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
							clip-rule="evenodd"
						/>
					</svg>
				</span>
				{title}
			</h3>

			<div class="mt-2 font text-gray-600 dark:text-gray-300 text-sm md:text-base">
				<slot name="text" />
			</div>
			<slot name="actions" />
		</div>
	</div>
</output>
