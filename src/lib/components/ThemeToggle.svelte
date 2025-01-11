<script>
	import { onMount } from 'svelte'

	let isDark = false

	onMount(() => {
		isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
		document.body.classList.toggle('dark', isDark)
	})

	function toggleTheme() {
		isDark = !isDark
		document.body.classList.toggle('dark', isDark)
	}
</script>

<button
	type="button"
	class="bg-gray-200 dark:bg-slate-800 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring focus:ring-gray-800 focus:dark:ring-slate-200"
	role="switch"
	aria-checked={isDark}
	on:click={toggleTheme}
>
	<span class="sr-only">Use setting</span>
	<span
		class="translate-x-0 bg-gray-50 dark:translate-x-5 dark:bg-slate-950 pointer-events-none relative inline-block h-5 w-5 transform rounded-full shadow shadow-gray-300 dark:shadow-slate-700/90 ring-0 transition duration-200 ease-in-out"
	>
		<span
			class="text-gray-700 opacity-100 dark:opacity-0 duration-200 ease-in absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
			aria-hidden="true"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24">
				<path
					fill="currentColor"
					d="M12 19a1 1 0 0 1 .993.883L13 20v1a1 1 0 0 1-1.993.117L11 21v-1a1 1 0 0 1 1-1zm6.313-2.09.094.083.7.7a1 1 0 0 1-1.32 1.497l-.094-.083-.7-.7a1 1 0 0 1 1.218-1.567l.102.07zm-11.306.083a1 1 0 0 1 .083 1.32l-.083.094-.7.7a1 1 0 0 1-1.497-1.32l.083-.094.7-.7a1 1 0 0 1 1.414 0zM4 11a1 1 0 0 1 .117 1.993L4 13H3a1 1 0 0 1-.117-1.993L3 11h1zm17 0a1 1 0 0 1 .117 1.993L21 13h-1a1 1 0 0 1-.117-1.993L20 11h1zM6.213 4.81l.094.083.7.7a1 1 0 0 1-1.32 1.497l-.094-.083-.7-.7A1 1 0 0 1 6.11 4.74l.102.07zm12.894.083a1 1 0 0 1 .083 1.32l-.083.094-.7.7a1 1 0 0 1-1.497-1.32l.083-.094.7-.7a1 1 0 0 1 1.414 0zM12 2a1 1 0 0 1 .993.883L13 3v1a1 1 0 0 1-1.993.117L11 4V3a1 1 0 0 1 1-1zm0 5a5 5 0 1 1-4.995 5.217L7 12l.005-.217A5 5 0 0 1 12 7z"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
				/>
			</svg>
			<!-- sun -->
		</span>
		<span
			class="opacity-0 dark:opacity-100 duration-200 ease-in absolute inset-0 flex h-full w-full text-slate-300 items-center justify-center transition-opacity"
			aria-hidden="true"
		>
			<!-- moon -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				class="h-4 w-4"
			>
				<path
					d="M12 21q-3.775 0-6.388-2.613T3 12q0-3.45 2.25-5.988T11 3.05q.625-.075.975.45t-.025 1.1q-.425.65-.638 1.375T11.1 7.5q0 2.25 1.575 3.825T16.5 12.9q.775 0 1.538-.225t1.362-.625q.525-.35 1.075-.037t.475.987q-.35 3.45-2.937 5.725T12 21Zm0-2q2.2 0 3.95-1.213t2.55-3.162q-.5.125-1 .2t-1 .075q-3.075 0-5.238-2.163T9.1 7.5q0-.5.075-1t.2-1q-1.95.8-3.163 2.55T5 12q0 2.9 2.05 4.95T12 19Zm-.25-6.75Z"
				/>
			</svg>
		</span>
	</span>
</button>
