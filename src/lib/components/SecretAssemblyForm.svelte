<script lang="ts">
	import { bytesToSizeString } from '$lib/utils/bytesToSizeString'
	import { initWorker } from '$lib/worker/initWorker'
	import { assembleSecretPayload } from '$lib'
	import type { SliceFilePayload } from '$lib/sliceFile'

	import { scale } from 'svelte/transition'

	import ErrorAlert from './ErrorAlert.svelte'
	import FileInput from './FileInput.svelte'
	import ResultPanel from './ResultPanel.svelte'
	import SliceFileCollector from './SliceFileCollector.svelte'
	import DownloadMultipleIcon from './icons/DownloadMultipleIcon.svelte'
	import EyeIcon from './icons/EyeIcon.svelte'
	import LoadingIcon from './icons/LoadingIcon.svelte'
	import WarningAlert from './WarningAlert.svelte'
	import { scrollIntoView } from './ScrollIntoViewAction'

	const DECODING_WARNING_BYTE_LENGTH_THRESHOLD = 100000 // 0.1MB

	let uploadedFiles = $state<File[]>([])
	let encryptedPayloadFile = $state<File | null>(null)
	let showEncryptedPayloadInput = $state(false)

	let isAssemblingSecret = $state(false)
	let errorMessage = $state('')
	let isShowError = $state(false)
	let isShowAssemblyResult = $state(false)

	let secretBuffer = $state<Uint8Array | null>(null)
	let secretDownloadUrl = $state('')
	let secretByteLength = $state(0)
	let secretFilename = $state('')

	let decodedSecret = $state<string | null>(null)
	let isDecodingSecret = $state(false)
	let isShowDecodedSecret = $state(false)
	let isShowDecodingWarning = $state(false)

	$effect(() => {
		return () => {
			if (secretDownloadUrl) URL.revokeObjectURL(secretDownloadUrl)
		}
	})

	async function handleSubmit(event: Event): Promise<void> {
		event.preventDefault()
		isAssemblingSecret = true
		resetErrorAndResults()

		try {
			const sliceFileBuffers = await Promise.all(uploadedFiles.map((file) => file.arrayBuffer()))

			const encryptedPayloadView = encryptedPayloadFile
				? new Uint8Array(await encryptedPayloadFile.arrayBuffer())
				: undefined

			const payload: SliceFilePayload = await assembleSecretPayload(
				sliceFileBuffers,
				encryptedPayloadView
			)
			setSecretProperties(payload)
			uploadedFiles = []
			encryptedPayloadFile = null
			isShowAssemblyResult = true
		} catch (error) {
			handleError(error)
		} finally {
			isAssemblingSecret = false
		}
	}

	function resetErrorAndResults() {
		errorMessage = ''
		decodedSecret = null
		isShowDecodedSecret = false
		isShowAssemblyResult = false
	}

	function handleError(error: unknown, defaultMessage = 'An unexpected error occurred') {
		errorMessage = error instanceof Error ? error.message : defaultMessage
		isShowError = true
	}

	function setSecretProperties(payload: SliceFilePayload): void {
		secretBuffer = payload.data
		secretByteLength = secretBuffer.byteLength ?? 0
		secretFilename = payload.metadata.filename ?? 'diceslice.txt'
		if (secretBuffer) {
			secretDownloadUrl = createDownloadUrl(new Uint8Array(secretBuffer))
		}
	}

	function createDownloadUrl(buffer: Uint8Array): string {
		const fileBlob = new Blob([buffer], { type: 'application/octet-stream' })
		return URL.createObjectURL(fileBlob)
	}

	async function toggleDecodedSecretDisplay(): Promise<void> {
		if (decodedSecret != null) {
			isShowDecodedSecret = !isShowDecodedSecret
			return
		}

		if (secretBuffer && secretBuffer.byteLength >= DECODING_WARNING_BYTE_LENGTH_THRESHOLD) {
			isShowDecodingWarning = true
		} else {
			await decodeSecret()
			isShowDecodedSecret = true
		}
	}

	async function ignoreWarningAndDecode(): Promise<void> {
		isShowDecodingWarning = false
		await decodeSecret()
		isShowDecodedSecret = true
	}

	async function decodeSecret(): Promise<void> {
		if (!secretBuffer) {
			handleError(new Error('No data to decode'))
			return
		}

		const { workerApi, terminateWorker } = initWorker()
		isDecodingSecret = true

		try {
			decodedSecret = await workerApi.deserializeString(secretBuffer)
		} catch (error) {
			handleError(new Error('Could not decode secret.'))
		} finally {
			isDecodingSecret = false
			terminateWorker()
		}
	}
</script>

<div class="my-2">
	<form onsubmit={handleSubmit}>
		<div class="my-2">
			<SliceFileCollector bind:fileArray={uploadedFiles} />

			<div class="my-8">

					<FileInput
						bind:fileInput={encryptedPayloadFile}
						label="Upload encrypted secret file (optional)"
						description="Upload your secret payload (created with detached mode) to decrypt with the uploaded keys."
						required={false}
					/>
			</div>
		</div>
		<div class="mt-3">
			<button
				type="submit"
				disabled={!uploadedFiles.length || isAssemblingSecret}
				class="px-4 py-2 bg-assemble text-white font-medium rounded-md disabled:bg-gray-300,bg-gray-300"
			>
				{#if isAssemblingSecret}
					<div class="flex items-center">
						<LoadingIcon />
						Assembling Files...
					</div>
				{:else}
					Recover Secret
				{/if}
			</button>
		</div>
	</form>
</div>

{#if isShowError}
	<ErrorAlert title="Could not recover secret">
		<p class="mb-2">{errorMessage}</p>
		<span>Ensure that all uploaded files are valid slice files.</span>
	</ErrorAlert>
{:else if isShowAssemblyResult}
	<ResultPanel title="Decrypted successfully!">
		<p slot="text">Click to download your secret or view the content of the file.</p>

		<div slot="actions">
			<div class="mt-4 grid grid-cols-1 xl:grid-cols-1 gap-2">
				<div class="col-span-1">
					<a
						type="button"
						class="btn-secondary w-full"
						download={secretFilename}
						href={secretDownloadUrl}
					>
						<DownloadMultipleIcon />
						Download {secretFilename} ({bytesToSizeString(secretByteLength)})
					</a>
				</div>
				<div class="col-span-1">
					<button type="button" class="btn-secondary w-full" onclick={toggleDecodedSecretDisplay}>
						{#if isDecodingSecret}
							<div class="flex items-center">
								<LoadingIcon />
								Decoding Secret
							</div>
						{:else}
							<EyeIcon />
							{isShowDecodedSecret ? 'Hide' : 'Show'} your secret
						{/if}
					</button>
					{#key isShowDecodedSecret}
						<div transition:scale={{ duration: 300 }}>
							{#if isShowDecodedSecret}
								<div class="mt-3" use:scrollIntoView>
									<label for="secretPlaintext" class="form-label">
										Your secret (UTF-8 encoded):
									</label>
									<textarea
										readonly
										class="form-input-additional bg-slate-800"
										rows="6"
										value={decodedSecret}
									></textarea>
								</div>
							{:else if isShowDecodingWarning}
								<WarningAlert
									title="Proceed with caution"
									buttons={[{ label: 'Decode secret', action: ignoreWarningAndDecode }]}
								>
									<span slot="text">
										Handling large files may cause browser unresponsiveness or even a crash. It is
										recommended to download and open it on your sytem.
									</span>
								</WarningAlert>
							{/if}
						</div>
					{/key}
				</div>
			</div>
		</div>
	</ResultPanel>
{/if}
