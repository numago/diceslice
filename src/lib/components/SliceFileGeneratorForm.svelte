<script lang="ts">
	import { bytesToSizeString } from '$lib/utils/bytesToSizeString'
	import { createQrCodes, MAX_QR_SECRET_SIZE } from '$lib/utils/qr'
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
	let generateQrCodes = $state(true)
	let isQrCodesGenerated = $state(false)

	let isGeneratingFiles = $state(false)
	let generatedWithParams = $state({ sliceCount: 0, sliceThreshold: 0 })

	type DownloadData = { url: string; filename: string; fileSize: number }
	let sliceFileDownloads = $state<DownloadData[]>([])
	let qrCodeDownloads = $state<DownloadData[]>([])
	let zipDownload = $state<DownloadData | null>(null)

	const downloadsSize = $derived(sliceFileDownloads.reduce((sum, file) => sum + file.fileSize, 0))
	const qrDownloadsSize = $derived(qrCodeDownloads.reduce((sum, file) => sum + file.fileSize, 0))

	let errorMessage = $state('')
	const showError = $derived(errorMessage.length > 0)
	let showResult = $state(false)

	function createDownloadData(blob: Blob, filename: string): DownloadData {
		const url = URL.createObjectURL(blob)
		return {
			url,
			filename,
			fileSize: blob.size
		}
	}

	async function handleFormSubmit(event: Event) {
		event.preventDefault()
		isQrCodesGenerated = false
		isGeneratingFiles = true
		errorMessage = ''
		sliceFileDownloads = []
		qrCodeDownloads = []
		zipDownload = null
		showResult = false

		try {
			const sliceFileBuffers = await createSliceFileBuffers()

			sliceFileDownloads = sliceFileBuffers.map((blob, i) => {
				const filename = binaryFilename(i)
				return createDownloadData(blob, filename)
			})

			let qrCodePngs = null

			if (generateQrCodes) {
				qrCodePngs = await createQrCodes(sliceFileBuffers)
				if (qrCodePngs) {
					qrCodeDownloads = qrCodePngs.map((blob, i) => {
						const filename = qrCodeFilename(i)
						return createDownloadData(blob, filename)
					})
					isQrCodesGenerated = true
				}
			}

			zipDownload = await generateZipDownloadData(sliceFileBuffers, qrCodePngs)

			generatedWithParams = { sliceCount, sliceThreshold }
			secretInputRef?.clearAllInputs()
			showResult = true
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
		} finally {
			isGeneratingFiles = false
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

	async function createSliceFileBuffers(): Promise<Blob[]> {
		if (secretInput == undefined) {
			throw new Error('No input data provided')
		}

		const secretBuffer = await serializeSecret(secretInput)
		const data = new Uint8Array(secretBuffer)
		const metadata = getSecretMetadata()

		const buffers = await generateSliceFileBuffers(sliceThreshold, sliceCount, { data, metadata })
		return buffers.map(
			(buffer: ArrayBuffer) => new Blob([buffer], { type: 'application/octet-stream' })
		)
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

	async function generateZipDownloadData(
		sliceBuffers: Blob[],
		qrCodePngs: Blob[] | null
	): Promise<DownloadData> {
		const zip = new JSZip()

		sliceBuffers.forEach((sliceBuffer, index) => {
			zip.file(binaryFilename(index), sliceBuffer)
		})

		if (qrCodePngs) {
			qrCodePngs.forEach((qrCodePng, index) => {
				zip.file(qrCodeFilename(index), qrCodePng)
			})
		}

		const zipBlob = await zip.generateAsync({ type: 'blob' })
		const zipUrl = URL.createObjectURL(zipBlob)

		return {
			url: zipUrl,
			filename: 'slicefiles.zip',
			fileSize: zipBlob.size
		}
	}

	const binaryFilename = (index: number) => `file-${index + 1}.slice.bin`
	const qrCodeFilename = (index: number) => `file-${index + 1}.slice.qr.png`

	function downloadFile(download: DownloadData): void {
		const a = document.createElement('a')
		a.href = download.url
		a.download = download.filename
		a.click()
		URL.revokeObjectURL(download.url)
	}

	function triggerSequentialDownloads(downloads: DownloadData[]): void {
		downloads.forEach((download, index) => {
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
	<form onsubmit={handleFormSubmit}>
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

		<hr class="my-4 border-gray-200 dark:border-slate-700" />
		<div class="my-4">
			<div class="flex items-start">
				<div class="flex items-center h-5">
					<input
						id="generateQrCodes"
						type="checkbox"
						bind:checked={generateQrCodes}
						class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-generate dark:bg-gray-700 dark:border-gray-600"
					/>
				</div>
				<div class="ml-3 text-sm">
					<label for="generateQrCodes" class="font-medium text-gray-700 dark:text-slate-300"
						>Generate QR-codes</label
					>
					<p class="text-sm font-light text-gray-600 dark:text-slate-400">
						QR-codes will not be generated for secrets larger than {MAX_QR_SECRET_SIZE} bytes (character
						count varies with encoding).
					</p>
				</div>
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
					<span class="drop-shadow-md">Generate Files</span>
				{/if}
			</button>
		</div>
	</form>
</div>

{#if showError}
	<ErrorAlert>{errorMessage}</ErrorAlert>
{:else if showResult}
	<ResultPanel title=" Your slice files are ready!">
		<div slot="text">
			Click to download your generated slice files. You will need at least {generatedWithParams.sliceThreshold}
			of the {generatedWithParams.sliceCount}
			files to recover your secret.
		</div>

		<div slot="actions">
			<div class="mt-4 space-y-3">
				<button
					type="button"
					class="btn-secondary w-full"
					onclick={() => triggerSequentialDownloads(sliceFileDownloads)}
					tabindex={0}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-6 shrink-0"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
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

				{#if qrCodeDownloads.length > 0}
					<button
						type="button"
						class="btn-secondary w-full"
						onclick={() => triggerSequentialDownloads(qrCodeDownloads)}
						tabindex={0}
					>
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
								d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"
							/>
						</svg>
						<div class="sm:grow-0 grow">
							<span class="inline-block"> Download {qrCodeDownloads.length} QR-codes </span>
							<span class="inline-block">
								({bytesToSizeString(qrDownloadsSize)} total)
							</span>
						</div>
					</button>
				{/if}
				<button
					type="button"
					class="btn-secondary w-full"
					onclick={triggerZipDownload}
					tabindex={0}
				>
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
						<span class="inline-block"> Download all as ZIP archive </span>
						<span class="inline-block">
							({zipDownload ? bytesToSizeString(zipDownload.fileSize) : '0 B'})
						</span>
					</div>
				</button>

				{#if generateQrCodes && !isQrCodesGenerated}
					<p class="text-sm text-gray-600 dark:text-slate-300 text-center">
						No QR-codes generated; the secret is too large for QR code format.
					</p>
				{/if}
			</div>
		</div>
	</ResultPanel>
{/if}
