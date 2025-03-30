<script lang="ts">
	import { bytesToSizeString } from '$lib/utils/bytesToSizeString'
	import { createQrCode, MAX_QR_SECRET_SIZE } from '$lib/utils/qr'
	import { initWorker } from '$lib/worker/initWorker'
	import JSZip from 'jszip'

	import ErrorAlert from './ErrorAlert.svelte'
	import ResultPanel from './ResultPanel.svelte'
	import SecretInput from './SecretInput.svelte'
	import LoadingIcon from './icons/LoadingIcon.svelte'
	import { generateSliceFileBuffers, generateDetachedSliceFileBuffers } from '$lib'
	import type { SliceFileMetadata } from '$lib/sliceFile'

	type FormState = {
		sliceCount: number
		sliceThreshold: number
		secretInput: File | string | null
		secretInputRef: SecretInput | null
		generateQrCodes: boolean
		generateDetachedFiles: boolean
		isGeneratingFiles: boolean
	}

	type DownloadData = {
		url: string
		filename: string
		fileSize: number
		blob: Blob
	}

	let formState = $state<FormState>({
		sliceCount: 5,
		sliceThreshold: 2,
		secretInput: null,
		secretInputRef: null,
		generateQrCodes: true,
		generateDetachedFiles: false,
		isGeneratingFiles: false
	})

	let sliceFileDownloads = $state<DownloadData[]>([])
	let qrCodeDownloads = $state<DownloadData[]>([])
	let keyQrCodeDownloads = $state<DownloadData[]>([])
	let secretDownload = $state<DownloadData | null>(null)
	let keyDownloads = $state<DownloadData[]>([])
	let zipDownload = $state<DownloadData | null>(null)
	let generatedWithParams = $state({
		sliceCount: 0,
		sliceThreshold: 0,
		generateQrCodes: false,
		generateDetachedFiles: false
	})
	let errorMessage = $state('')
	let showResult = $state(false)
	const showError = $derived(errorMessage.length > 0)

	async function handleFormSubmit(event: Event): Promise<void> {
		event.preventDefault()
		formState.isGeneratingFiles = true
		resetResultState()

		try {
			if (formState.generateDetachedFiles) {
				const detachedSliceFiles = await createDetachedSliceFileBuffers()
				secretDownload = createDownloadData(
					detachedSliceFiles.payloadBuffer,
					'slicefile-secret.bin'
				)

				for (const [i, headerBuffer] of detachedSliceFiles.headerBuffers.entries()) {
					keyDownloads.push(createDownloadData(headerBuffer, `slicefile-key-${i + 1}.bin`))
					if (formState.generateQrCodes) {
						const qrDownload = await createQrDownload(
							headerBuffer,
							`slicefile-key-qrcode-${i + 1}.png`
						)
						if (qrDownload) keyQrCodeDownloads.push(qrDownload)
					}
				}
			} else {
				const sliceFiles = await createSliceFileBuffers()
				for (const [i, buffer] of sliceFiles.entries()) {
					sliceFileDownloads.push(createDownloadData(buffer, `slicefile-${i + 1}.bin`))
					if (formState.generateQrCodes) {
						const qrDownload = await createQrDownload(buffer, `slicefile-qrcode-${i + 1}.png`)
						if (qrDownload) qrCodeDownloads.push(qrDownload)
					}
				}
			}

			const allDownloads = [
				...sliceFileDownloads,
				...(secretDownload ? [secretDownload] : []),
				...keyDownloads,
				...qrCodeDownloads,
				...keyQrCodeDownloads
			]
			zipDownload = await generateZipDownloadData(allDownloads)

			generatedWithParams = {
				sliceCount: formState.sliceCount,
				sliceThreshold: formState.sliceThreshold,
				generateQrCodes: formState.generateQrCodes,
				generateDetachedFiles: formState.generateDetachedFiles
			}
			formState.secretInputRef?.clearAllInputs()
			showResult = true
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
		} finally {
			formState.isGeneratingFiles = false
		}
	}

	function createDownloadData(buffer: ArrayBuffer | Blob, filename: string): DownloadData {
		const blob = new Blob([buffer], { type: 'application/octet-stream' })
		const url = URL.createObjectURL(blob)
		return {
			url,
			filename,
			fileSize: blob.size,
			blob
		}
	}

	function resetResultState() {
		errorMessage = ''
		sliceFileDownloads = []
		qrCodeDownloads = []
		keyQrCodeDownloads = []
		secretDownload = null
		keyDownloads = []
		zipDownload = null
		showResult = false
	}

	async function createQrDownload(
		buffer: ArrayBuffer,
		filename: string
	): Promise<DownloadData | null> {
		try {
			const qrCodeBlob = await createQrCode(buffer)
			if (!qrCodeBlob) {
				return null
			}
			return createDownloadData(qrCodeBlob, filename)
		} catch (error) {
			console.error(`Failed to create QR code for ${filename}:`, error)
			return null
		}
	}

	async function serializeSecret(secretInput: File | string): Promise<Uint8Array> {
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

	async function prepareSecretData() {
		if (formState.secretInput === null) {
			throw new Error('No input data provided')
		}

		const secretBuffer = await serializeSecret(formState.secretInput)
		const data = new Uint8Array(secretBuffer)
		const metadata = getSecretMetadata()

		return { data, metadata }
	}

	async function createSliceFileBuffers(): Promise<ArrayBuffer[]> {
		const { data, metadata } = await prepareSecretData()
		return generateSliceFileBuffers(formState.sliceThreshold, formState.sliceCount, {
			data,
			metadata
		})
	}

	async function createDetachedSliceFileBuffers(): Promise<{
		payloadBuffer: ArrayBuffer
		headerBuffers: ArrayBuffer[]
	}> {
		const { data, metadata } = await prepareSecretData()
		return generateDetachedSliceFileBuffers(formState.sliceThreshold, formState.sliceCount, {
			data,
			metadata
		})
	}

	function getSecretMetadata(): SliceFileMetadata {
		let filename: string | undefined

		if (formState.secretInput instanceof File) {
			filename = formState.secretInput.name
		}

		return {
			filename
		}
	}

	async function generateZipDownloadData(fileDownloads: DownloadData[]): Promise<DownloadData> {
		const zip = new JSZip()

		for (const download of fileDownloads) {
			zip.file(download.filename, download.blob)
		}

		const zipBlob = await zip.generateAsync({ type: 'blob' })
		return createDownloadData(zipBlob, 'slicefiles.zip')
	}

	function downloadFile(download: DownloadData): void {
		const a = document.createElement('a')
		a.href = download.url
		a.download = download.filename
		a.click()
	}

	function triggerSequentialDownloads(downloads: DownloadData[]): void {
		downloads.forEach((download, index) => {
			setTimeout(() => {
				downloadFile(download)
			}, index * 300)
		})
	}

	function triggerZipDownload(): void {
		if (zipDownload) {
			downloadFile(zipDownload)
		}
	}

	function sumFileSizes(downloads: DownloadData[]): number {
		return downloads.reduce((sum, file) => sum + file.fileSize, 0)
	}
</script>

<div>
	<form onsubmit={handleFormSubmit}>
		<SecretInput bind:secret={formState.secretInput} bind:this={formState.secretInputRef} />
		<div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
			<div>
				<label for="shareCount" class="form-label">Number of slice files</label>
				<input
					required
					min="2"
					max="255"
					bind:value={formState.sliceCount}
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
					max={formState.sliceCount}
					bind:value={formState.sliceThreshold}
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
						bind:checked={formState.generateQrCodes}
						class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-generate dark:bg-gray-700 dark:border-gray-600"
					/>
				</div>
				<div class="ml-3">
					<label for="generateQrCodes" class="font-medium text-gray-700 dark:text-slate-300"
						>Generate QR-codes</label
					>
					<p class="text-sm font-light text-gray-600 dark:text-slate-400">
						QR-codes cannot be generated for secrets larger than {MAX_QR_SECRET_SIZE} bytes (character
						count varies with encoding) if not using detached mode.
					</p>
				</div>
			</div>
		</div>

		<div class="my-4">
			<div class="flex items-start">
				<div class="flex items-center h-5">
					<input
						id="isDetached"
						type="checkbox"
						bind:checked={formState.generateDetachedFiles}
						class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-generate dark:bg-gray-700 dark:border-gray-600"
					/>
				</div>
				<div class="ml-3">
					<label for="isDetached" class="font-medium text-gray-700 dark:text-slate-300"
						>Detached mode</label
					>
					<p class="text-sm font-light text-gray-600 dark:text-slate-400">
						Store the encrypted secret and the keys in separate files. 
					</p>
				</div>
			</div>
		</div>

		<div class="mt-5">
			<button
				type="submit"
				disabled={formState.isGeneratingFiles}
				class="px-4 py-2 bg-generate text-white font-medium rounded-md disabled:bg-inherit disabled:text-gray-600 dark:disabled:text-slate-400"
				aria-busy={formState.isGeneratingFiles ? 'true' : 'false'}
			>
				{#if formState.isGeneratingFiles}
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
	<ResultPanel title=" Your downloads are ready!">
		<div slot="actions">
			{#if !generatedWithParams.generateDetachedFiles}
				<div class="mt-4 space-y-3">
					<p class="text-sm text-slate-200">
						Click to download your generated slice files. All you'll need is at least {generatedWithParams.sliceThreshold}
						of the {generatedWithParams.sliceCount}
						files to recover your secret.
					</p>
					{#if sliceFileDownloads.length > 0}
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
								class="size-5 shrink-0 my-2"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
								/>
							</svg>
							<div class="sm:grow-0 grow">
								<span class="inline-block">
									Download {sliceFileDownloads.length} slice files
								</span>
								<span class="inline-block text-slate-500 text-xs">
									({bytesToSizeString(sumFileSizes(sliceFileDownloads))} total)
								</span>
							</div>
						</button>
					{/if}

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
								class="size-5 shrink-0 my-2"
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
								<span class="inline-block"> Download {qrCodeDownloads.length} slice QR-codes </span>
								<span class="inline-block text-slate-500 text-xs">
									({bytesToSizeString(sumFileSizes(qrCodeDownloads))} total)
								</span>
							</div>
						</button>
					{/if}
				</div>
			{:else}
				<div class="mt-4 space-y-3">
					{#if secretDownload}
						<p class="flex text-sm w-full text-slate-200">
							This file contains your encrypted secret. It can only be accessed with the keys below,
							so it's safe to store or share anywhere.
						</p>
						<button
							type="button"
							class="btn-secondary w-full"
							onclick={() => secretDownload && downloadFile(secretDownload)}
							tabindex={0}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="size-5 shrink-0 my-2"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
								/>
							</svg>

							<div class="sm:grow-0 grow">
								<span class="inline-block">Download encrypted secret</span>
								<span class="inline-block text-slate-500 text-xs">
									({bytesToSizeString(secretDownload.fileSize)})
								</span>
							</div>
						</button>
					{/if}
					{#if keyDownloads.length > 0}
						<p class="flex text-sm w-full text-slate-200">
							Use the following keys to recover the encrypted secret file. You will at least need
							{generatedWithParams.sliceThreshold} of the {generatedWithParams.sliceCount} keys to recover
							the secret.
						</p>
						<button
							type="button"
							class="btn-secondary w-full"
							onclick={() => triggerSequentialDownloads(keyDownloads)}
							tabindex={0}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="size-5 shrink-0 my-2"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
								/>
							</svg>

							<div class="sm:grow-0 grow">
								<span class="inline-block">Download {keyDownloads.length} key files</span>
								<span class="inline-block text-slate-500 text-xs">
									({bytesToSizeString(sumFileSizes(keyDownloads))} total)
								</span>
							</div>
						</button>
					{/if}

					{#if keyQrCodeDownloads.length > 0}
						<button
							type="button"
							class="btn-secondary w-full"
							onclick={() => triggerSequentialDownloads(keyQrCodeDownloads)}
							tabindex={0}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="size-5 shrink-0 my-2"
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
								<span class="inline-block">
									Download {keyQrCodeDownloads.length} key QR-codes
								</span>
								<span class="inline-block text-slate-500 text-xs">
									({bytesToSizeString(sumFileSizes(keyQrCodeDownloads))} total)
								</span>
							</div>
						</button>
					{/if}
				</div>
			{/if}
			<div class="mt-4 space-y-3">
				{#if zipDownload}
					<div class="relative">
						<div class="absolute inset-0 flex items-center" aria-hidden="true">
							<div class="w-full border-t border-slate-500"></div>
						</div>
						<div class="relative flex justify-center">
							<span class="bg-slate-700 px-2 text-sm text-slate-400">or</span>
						</div>
					</div>
					<p class="flex text-sm w-full text-slate-200">
						Download all the above files in one time as a ZIP archive.
					</p>
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
							class="size-5 shrink-0 my-2"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
							/>
						</svg>
						<div class="sm:grow-0 grow">
							<span class="inline-block"> Download all as ZIP archive </span>
							<span class="inline-block text-slate-500 text-xs">
								({bytesToSizeString(zipDownload.fileSize)})
							</span>
						</div>
					</button>
				{/if}

				{#if generatedWithParams.generateQrCodes && !qrCodeDownloads.length && !keyQrCodeDownloads.length}
					<p class="text-sm text-gray-600 dark:text-slate-300 text-center">
						No QR-codes generated; the secret is too large for QR code format.
					</p>
				{/if}
			</div>
		</div>
	</ResultPanel>
{/if}
