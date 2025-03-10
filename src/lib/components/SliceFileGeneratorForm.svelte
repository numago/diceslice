<script lang="ts">
	import { bytesToSizeString } from '$lib/utils'
	import { initWorker } from '$lib/worker/initWorker'
	import JSZip from 'jszip'

	import ErrorAlert from './ErrorAlert.svelte'
	import ResultPanel from './ResultPanel.svelte'
	import SecretInput from './SecretInput.svelte'
	import LoadingIcon from './icons/LoadingIcon.svelte'
	import { generateSliceFileBuffers } from '$lib'
	import type { SliceFileMetadata } from '$lib/sliceFile'

	let sliceCount = $state(5)
	let sliceThreshold = $state(2)
	let secretInput = $state<File | string | null>(null)
	let secretInputRef = $state<SecretInput | null>(null)

	let isGeneratingFiles = $state(false)
	let generatedWithParams = $state({ sliceCount: 0, sliceThreshold: 0 })

	type DownloadData = { url: string; filename: string; fileSize: number }
	let sliceFileDownloads = $state<DownloadData[]>([])
	let zipDownload = $state<DownloadData | null>(null)
	
	const downloadsSize = $derived(sliceFileDownloads.reduce((sum, file) => sum + file.fileSize, 0))

	let errorMessage = $state('')
	
	const showError = $derived(errorMessage.length > 0)

	// Function to handle form submission with preventDefault
	function handleSubmit(event: Event) {
		event.preventDefault()
		submitForm()
	}

	async function submitForm() {
		isGeneratingFiles = true
		errorMessage = ''
		sliceFileDownloads = []
		zipDownload = null

		try {
			const sliceFileBuffers = await createSliceFileBuffers()
			sliceFileDownloads = generateFileDownloadsData(sliceFileBuffers)
			zipDownload = await generateZipDownloadData(sliceFileBuffers)
			generatedWithParams = { sliceCount, sliceThreshold }
			secretInputRef?.clearAllInputs()
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
		} finally {
			isGeneratingFiles = false
		}
	}

	// Helper function to prevent default and call the provided function
	function preventDefaultAndCall(fn: () => void) {
		return (event: Event) => {
			event.preventDefault()
			fn()
		}
	}

	async function serializeSecret(secretInput: File | string): Promise<ArrayBuffer> {
		const { workerApi, terminateWorker } = initWorker()
		try {
			if (secretInput instanceof File) {
				return await workerApi.serializeFile(secretInput)
			} else {
				return await workerApi.serializeString(secretInput)
			}
		} finally {
			terminateWorker()
		}
	}

	async function createSliceFileBuffers(): Promise<ArrayBuffer[]> {
		if (secretInput == undefined) {
			throw new Error('No input data provided')
		}

		const secretBuffer = await serializeSecret(secretInput)
		const data = new Uint8Array(secretBuffer)
		const metadata = getSecretMetadata()

		return generateSliceFileBuffers(sliceThreshold, sliceCount, { data, metadata })
	}

	function getSecretMetadata(): SliceFileMetadata {
		let filename: string | undefined

		if (secretInput instanceof File) {
			filename = secretInput.name
		}

		return {
			filename
		}
	}

	function generateFilename(index: number) {
		const extension = '.slice'
		return `file-${index + 1}` + extension
	}

	function generateFileDownloadsData(sliceBuffers: ArrayBuffer[]): DownloadData[] {
		return sliceBuffers.map((sliceBuffer, i) => {
			const blob = new Blob([sliceBuffer], { type: 'application/octet-stream' })
			const url = URL.createObjectURL(blob)
			return {
				url,
				filename: generateFilename(i),
				fileSize: blob.size
			}
		})
	}

	async function generateZipDownloadData(sliceBuffers: ArrayBuffer[]): Promise<DownloadData> {
		const zip = new JSZip()
		
		sliceBuffers.forEach((buffer, index) => {
			zip.file(generateFilename(index), buffer)
		})
		
		const zipBlob = await zip.generateAsync({ type: 'blob' })
		const zipUrl = URL.createObjectURL(zipBlob)
		
		return {
			url: zipUrl,
			filename: 'slicefiles.zip',
			fileSize: zipBlob.size
		}
	}

	function downloadFile(download: DownloadData): void {
		const a = document.createElement('a')
		a.href = download.url
		a.download = download.filename
		a.click()
		URL.revokeObjectURL(download.url)
	}

	function triggerSequentialDownloads(): void {
		sliceFileDownloads.forEach((download, index) => {
			setTimeout(() => {
				downloadFile(download)
			}, index * 100)
		})
	}

	function triggerZipDownload(): void {
		if (zipDownload) {
			downloadFile(zipDownload)
		}
	}
</script>

<div>
	<form onsubmit={handleSubmit}>
		<SecretInput bind:secret={secretInput} bind:this={secretInputRef} />
		<div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
			<div>
				<label for="shareCount" class="form-label">Number of slice files</label>
				<input
					required
					min="2"
					max="255"
					bind:value={sliceCount}
					id="shareCount"
					type="number"
					class="form-input-additional focus-within:ring-generate"
				/>
				<p class="mt-3 text-sm leading-6 text-gray-600 dark:text-slate-400">
					Number of files to generate
				</p>
			</div>
			<div>
				<label for="shareThreshold" class="form-label">Threshold</label>
				<input
					required
					min="2"
					max={sliceCount}
					bind:value={sliceThreshold}
					id="shareThreshold"
					type="number"
					class="form-input-additional focus-within:ring-generate"
				/>
				<p class="mt-3 text-sm leading-6 text-gray-600 dark:text-slate-400">
					Number of files to unlock the secret
				</p>
			</div>
		</div>

		<div class="mt-5">
			<button
				type="submit"
				disabled={isGeneratingFiles}
				class="px-4 py-2 bg-generate text-white font-medium rounded-md disabled:bg-inherit disabled:text-gray-600 dark:disabled:text-slate-400"
				aria-busy={isGeneratingFiles ? 'true' : 'false'}
			>
				{#if isGeneratingFiles}
					<div class="flex items-center mr-6">
						<LoadingIcon />
						<span class="ml-1">Generating files...</span>
					</div>
				{:else}
					Generate Files
				{/if}
			</button>
		</div>
	</form>
</div>

{#if showError}
	<ErrorAlert>{errorMessage}</ErrorAlert>
{:else if sliceFileDownloads.length > 0}
	<ResultPanel title=" Your slice files are ready!">
		<p slot="text">
			Click to download your generated slice files. You will need at least {generatedWithParams.sliceThreshold}
			of the {generatedWithParams.sliceCount}
			files to recover your secret.
		</p>

		<div slot="actions">
			<div class="mt-4 space-y-3">
				<button
					type="button"
					class="btn-secondary w-full"
					onclick={preventDefaultAndCall(triggerSequentialDownloads)}
					tabindex={0}
				>
					<!-- arrow down square stack icon -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-6 w-6 shrink-0"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m-6 3.75l3 3m0 0l3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75"
						/>
					</svg>
					<div class="sm:grow-0 grow">
						<span class="inline-block">
							Download {sliceFileDownloads?.length} slice files
						</span>
						<span class="inline-block">
							({bytesToSizeString(downloadsSize)} total)
						</span>
					</div>
				</button>

				<button
					type="button"
					class="btn-secondary w-full"
					onclick={preventDefaultAndCall(triggerZipDownload)}
					tabindex={0}
				>
					<!-- archive box arrow down icon -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="w-6 h-6 shrink-0"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
						/>
					</svg>
					<div class="sm:grow-0 grow">
						<span class="inline-block">
							Download ZIP archive
						</span>
						<span class="inline-block">
							({zipDownload ? bytesToSizeString(zipDownload.fileSize) : '0 B'})
						</span>
					</div>
				</button>
			</div>
		</div>
	</ResultPanel>
{/if}
