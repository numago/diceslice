<script lang="ts">
	import { scale, slide } from 'svelte/transition'
	import QRScanner from './QRScanner.svelte'
	import FileUploadArea from './FileUploadArea.svelte'
	import { scanImageForQRCode, processQRCodeData } from '$lib/utils/qr'
	import { scrollIntoView } from './ScrollIntoViewAction'

	let { fileArray = $bindable() } = $props<{ fileArray: File[] }>()
	let errorMessage = $state<string | null>(null)

	async function handleFileSelect(files: FileList) {
		await addFiles(files)
	}

	function handleQRScan(file: File) {
		fileArray = [...fileArray, file]
		errorMessage = null
	}

	async function addFiles(newFiles: FileList) {
		const processFile = async (file: File) => {
			if (file.type === 'image/png') {
				return processPngFile(file)
			}
			return file
		}

		const filesToAdd = await Promise.all(Array.from(newFiles).map(processFile))
		fileArray = [...fileArray, ...filesToAdd]
	}

	function removeFile(index: number) {
		fileArray = fileArray.filter((_: File, i: number) => i !== index)
		errorMessage = null
	}

	async function processPngFile(file: File): Promise<File> {
		try {
			const imageUrl = URL.createObjectURL(file)
			const qrData = await scanImageForQRCode(imageUrl)

			if (qrData) {
				return processQRCodeData(qrData, file.name)
			} else {
				errorMessage = `No QR code found in image "${file.name}". File added as regular file.`
			}
		} catch (error) {
			errorMessage = `Failed to scan "${file.name}" for QR code: ${error instanceof Error ? error.message : 'Unknown error'}`
		}

		return file
	}

	function isFileFromQRCode(file: File): boolean {
		return file.name.endsWith('.qr') || file.name.endsWith('.png')
	}
</script>

<p class="form-label">Upload your slice files</p>
<FileUploadArea onFilesSelect={handleFileSelect} />

<p class="form-label">Scan QR codes</p>
<div class="mb-2">
	<QRScanner onscan={handleQRScan} />
</div>

<p class="form-label">Your uploaded files:</p>
{#if errorMessage}
	<div use:scrollIntoView class="mt-2 text-red-500 text-sm text-center" transition:scale>
		{errorMessage}
	</div>
{/if}
<ol role="list" class="divide-y divide-gray-100 dark:divide-slate-700">
	{#if fileArray.length}
		{#each fileArray as file, index (file.name + index)}
			<li transition:slide class="flex items-center justify-between gap-x-6 py-3">
				<div class="flex-1 min-w-0">
					<span
						class="inline rounded-full bg-gray-100 dark:bg-slate-700 px-2 py-1 text-sm font-medium text-gray-900 dark:text-slate-300 border border-gray-300 dark:border-slate-600 mr-2"
					>
						{index + 1}
					</span>
					<span
						class="text-gray-800 dark:text-slate-400 align-middle inline-flex items-center max-w-[calc(100%-3rem)]"
					>
						{#if isFileFromQRCode(file)}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="size-6 text-slate-300 inline-block mr-2 shrink-0"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"
								/>
							</svg>
						{/if}
						<span class="truncate inline-block align-middle">
							{file.name}
						</span>
					</span>
				</div>
				<button
					type="button"
					class="inline-flex items-center gap-x-1.5 rounded bg-white dark:bg-slate-800 px-2 py-1 text-sm font-semibold text-gray-600 dark:text-slate-400 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-slate-600 hover:bg-gray-50 hover:text-red-600 dark:hover:bg-slate-700 dark:hover:text-red-500 shrink-0"
					onclick={() => removeFile(index)}
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
