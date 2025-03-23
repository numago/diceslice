<script lang="ts">
	let { onFilesSelect } = $props<{
		onFilesSelect: (files: FileList) => void
	}>()

	function handleFileInput(event: Event) {
		const input = event.target as HTMLInputElement
		if (input?.files) {
			onFilesSelect(input.files)
			input.value = ''
		}
	}

	let dragOver = $state(false)

	function handleDrop(event: DragEvent) {
		event.preventDefault()
		dragOver = false
		if (event.dataTransfer?.files) {
			onFilesSelect(event.dataTransfer.files)
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault()
		dragOver = true
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault()
		dragOver = false
	}
</script>

<div class="flex items-center justify-center w-full">
	<label
		for="fileUploadInput"
		class="{dragOver ? 'border-assemble dark:border-assemble border-dashed' : 'border-solid'}
    flex flex-col items-center justify-center w-full h-40 border border-gray-300 hover:bg-gray-100 rounded-lg cursor-pointer bg-gray-50 dark:bg-slate-700 dark:border-slate-500 dark:hover:bg-slate-600 px-4"
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
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
			<p class="mb-2 text-sm text-gray-500 dark:text-slate-400 text-center">
				<span class="font-semibold">Click to upload</span> or drag and drop
			</p>
			<p class="text-xs text-gray-500 dark:text-slate-400 text-center">
				Upload the number of files required to recover your secret
			</p>
		</div>
		<input id="fileUploadInput" type="file" class="hidden" multiple oninput={handleFileInput} />
	</label>
</div>
