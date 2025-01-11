<script lang="ts">
	import { slide } from 'svelte/transition'

	export let fileArray: File[] = []
	let dragOver = false

	function handleFileInput(event: Event) {
		const input = event.target as HTMLInputElement
		if (input?.files) {
			addFiles(input.files)
			input.value = ''
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault()
		dragOver = false
		if (event.dataTransfer?.files) {
			addFiles(event.dataTransfer.files)
		}
	}

	function compositeFileId(file: File): string {
		return `${file.name}-${file.size}-${file.lastModified}`
	}

	function removeFile(index: number) {
		fileArray = fileArray.filter((_, i) => i !== index)
	}

	function addFiles(newFiles: FileList) {
		const existingFileIds = new Set(fileArray.map(compositeFileId))

		const uniqueFiles: File[] = Array.from(newFiles).filter(
			(file) => !existingFileIds.has(compositeFileId(file))
		)

		fileArray = [...fileArray, ...uniqueFiles]
	}
</script>

<!-- File input -->
<div class="flex items-center justify-center w-full">
	<label
		for="fileUploadInput"
		class="{dragOver ? 'border-assemble dark:border-assemble border-dashed' : 'border-solid'}
    flex flex-col items-center justify-center w-full h-40 border border-gray-300 hover:bg-gray-100 rounded-lg cursor-pointer bg-gray-50 dark:bg-slate-700 dark:border-slate-500 dark:hover:bg-slate-600 px-4"
		on:dragover|preventDefault={() => (dragOver = true)}
		on:dragleave|preventDefault={() => (dragOver = false)}
		on:drop|preventDefault={handleDrop}
	>
		<div class="flex flex-col items-center justify-center pt-5 pb-6">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				data-slot="icon"
				class="w-10 h-10 mb-4 text-gray-500 dark:text-slate-400"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m0-3-3-3m0 0-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-.75"
				/>
			</svg>
			<slot />
		</div>
		<input id="fileUploadInput" type="file" class="hidden" multiple on:input={handleFileInput} />
	</label>
</div>

<!-- Uploaded files overview -->
<p class="form-label">Your uploaded files:</p>
<ol role="list" class="divide-y divide-gray-100 dark:divide-slate-700">
	{#if fileArray.length}
		{#each fileArray as file, index (file.name)}
			<li transition:slide class="flex items-center justify-between gap-x-6 py-3">
				<div>
					<span
						class="inline items-center rounded-full bg-gray-100 dark:bg-slate-700 px-2 py-1 text-sm font-medium text-gray-900 dark:text-slate-300 border border-gray-300 dark:border-slate-600 mr-2"
					>
						{index + 1}
					</span>
					<span class="text-gray-800 dark:text-slate-400">
						{file.name}
					</span>
				</div>
				<button
					type="button"
					class="inline-flex items-center gap-x-1.5 rounded bg-white dark:bg-slate-800 px-2 py-1 text-sm font-semibold text-gray-600 dark:text-slate-400 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-slate-600 hover:bg-gray-50 hover:text-red-600 dark:hover:bg-slate-700 dark:hover:text-red-500"
					on:click={() => removeFile(index)}
					aria-label={`Remove ${file.name}`}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						data-slot="icon"
						class="w-4 h-4"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
						/>
					</svg>
					Remove
				</button>
			</li>
		{/each}
	{:else}
		<li class="flex text-gray-600 dark:text-slate-400 italic pb-3">No files uploaded yet.</li>
	{/if}
</ol>
