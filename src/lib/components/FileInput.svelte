<script lang="ts">
	import { bytesToSizeString } from '$lib/utils/bytesToSizeString'

	interface FileInputProps {
		fileInput?: File | null
		label?: string
		description?: string
		required?: boolean
	}

	let {
		fileInput = $bindable(null),
		label = 'Upload a file',
		description = '',
		required = false
	}: FileInputProps = $props()

	let fileInputElement: HTMLInputElement

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement
		if (input.files?.[0]) {
			fileInput = input.files[0]
		} else {
			fileInput = null
		}
	}

	export function clearFile() {
		fileInput = null
		if (fileInputElement) {
			fileInputElement.value = ''
		}
	}
</script>

<div>
	<div class="pb-3">
		<label for="fileInput" class="inline-flex text-slate-100 pt-5 font-medium">{label}</label>
		{#if description}
			<p class="text-sm text-slate-400">{description}</p>
		{/if}
	</div>
	<div class="file-input-container">
		<input
			{required}
			onchange={handleFileChange}
			bind:this={fileInputElement}
			id="fileInput"
			type="file"
			class="
				p-0
				rounded-md
				w-full
				border-0 outline-0
				focus-within:ring-generate
				file:py-2.5 file:mr-4 file:border-0 file:px-4 file:ring-2 file:ring-slate-800 file:rounded-l-md
				file:bg-slate-600 file:text-slate-200
                bg-slate-500 text-slate-100
			"
		/>
	</div>
</div>
