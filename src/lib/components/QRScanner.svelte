<script lang="ts">
	import { onDestroy, tick, onMount } from 'svelte'
	import { QRCanvas, frontalCamera, frameLoop } from '@paulmillr/qr/dom.js'
	import { scale } from 'svelte/transition'
	import { scrollIntoView } from './ScrollIntoViewAction'

	const SCAN_DEBOUNCE_TIME = 1000

	let isScannerActive = $state(false)
	let videoElement: HTMLVideoElement | null = $state(null)
	let qrCanvas: QRCanvas | null = $state(null)
	let qrCamera: any = $state(null)
	let cancelLoop: Function | null = $state(null)
	let lastScannedCode = $state('')
	let lastScannedTime = $state(0)
	let errorMessage = $state('')
	let successMessage = $state('')
	let showSuccessMessage = $state(false)
	let overlayCanvas: HTMLCanvasElement | null = $state(null)

	let { onscan } = $props<{
		onscan: (file: File) => void
	}>()

	let cameraAvailable = $state(true)
	let cameraPermissionDenied = $state(false)

	onMount(async () => {
		if (!navigator.mediaDevices?.getUserMedia) {
			cameraAvailable = false
			errorMessage = 'Camera API not supported in this browser.'
		}
	})

	onDestroy(() => {
		stopScanner()
	})

	async function checkCameraPermission(): Promise<boolean> {
		try {
			await navigator.mediaDevices.getUserMedia({ video: true })
			cameraPermissionDenied = false
			cameraAvailable = true
			errorMessage = ''
			return true
		} catch (error) {
			if (error instanceof DOMException && error.name === 'NotAllowedError') {
				cameraPermissionDenied = true
				cameraAvailable = false
				errorMessage = 'Camera access was denied. Please grant permission to use your camera.'
			} else {
				cameraAvailable = false
				errorMessage = 'Camera not available on this device or browser.'
			}
			return false
		}
	}

	async function toggleScanner(open?: boolean): Promise<void> {
		isScannerActive = open ?? !isScannerActive
		if (isScannerActive) {
			await tick() // wait until video element is in the DOM
			if (await checkCameraPermission()) {
				startScanner()
			} else {
				isScannerActive = false
			}
		} else {
			stopScanner()
		}
	}

	function processQRData(qrDataString: string): File {
		try {
			const binaryData = Uint8Array.from(qrDataString, (char) => char.charCodeAt(0))
			const timestamp = Date.now()
			return new File([binaryData], `${timestamp}.qr`, { type: 'application/octet-stream' })
		} catch (error) {
			throw new Error('Invalid QR code data format')
		}
	}

	async function startScanner(): Promise<void> {
		if (!videoElement) {
			errorMessage = 'Video element not found'
			isScannerActive = false
			return
		}

		errorMessage = ''
		showSuccessMessage = false

		try {
			// Create QR Canvas with overlay
			qrCanvas = new QRCanvas(
				{ overlay: overlayCanvas || undefined },
				{
					overlayTimeout: 500,
					overlayMainColor: 'rgba(0, 255, 0, 0.2)',
					overlayFinderColor: 'rgba(0, 0, 255, 0.4)',
					cropToSquare: true
				}
			)

			qrCamera = await frontalCamera(videoElement)

			cancelLoop = frameLoop(() => {
				const qrData = qrCamera.readFrame(qrCanvas)
				if (qrData) {
					const currentTime = Date.now()
					const isNewCode = qrData !== lastScannedCode
					const isDebounced = currentTime - lastScannedTime > SCAN_DEBOUNCE_TIME

					if (isNewCode || isDebounced) {
						lastScannedCode = qrData
						lastScannedTime = currentTime

						try {
							const file = processQRData(qrData)
							successMessage = 'QR code scanned successfully!'
							showSuccessMessage = true
							setTimeout(() => {
								showSuccessMessage = false
							}, 3000)
							onscan(file)
						} catch (error) {
							errorMessage = error instanceof Error ? error.message : 'Failed to process QR code'
							setTimeout(() => {
								errorMessage = ''
							}, 3000)
						}
					}
				}
			})
		} catch (error) {
			if (error instanceof Error) {
				errorMessage = `QR Scanner error: ${error.message}`
			} else {
				errorMessage = 'Unknown QR Scanner error'
			}
			isScannerActive = false
		}
	}

	function stopScanner(): void {
		if (cancelLoop) {
			cancelLoop()
			cancelLoop = null
		}

		if (qrCamera) {
			qrCamera.stop()
			qrCamera = null
		}

		if (qrCanvas) {
			qrCanvas.clear()
			qrCanvas = null
		}

		lastScannedCode = ''
		lastScannedTime = 0
		errorMessage = ''
		showSuccessMessage = false
	}
</script>

<div>
	{#if !isScannerActive}
		<button
			type="button"
			class="py-4 w-full items-center px-4 border border-gray-300 dark:border-slate-800 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-assemble"
			onclick={() => toggleScanner()}
			disabled={!cameraAvailable && !cameraPermissionDenied}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="size-6 text-slate-300 inline-block mr-2"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
				/>
			</svg>
			{#if cameraPermissionDenied}
				Try again with camera permission
			{:else}
				Open camera to scan QR codes
			{/if}
		</button>
		{#if cameraPermissionDenied}
			<p class="text-center mt-2 text-sm text-red-500">
				Camera access was denied. Please allow camera access in your browser settings to scan QR
				codes.
			</p>
		{:else if !cameraAvailable}
			<p class="text-center mt-2 text-sm text-gray-600 dark:text-slate-400">
				Scanning QR codes is not available on your device. Please ensure your device has a camera
				available and it is properly connected.
			</p>
		{:else}
			<p class="text-center mt-2 text-sm text-gray-600 dark:text-slate-400">
				Your browser will ask for permission to access your camera.
			</p>
		{/if}
	{/if}
</div>

{#if isScannerActive}
	<div use:scrollIntoView transition:scale={{ duration: 200 }}>
		<div class="relative rounded-xl overflow-hidden">
			<video bind:this={videoElement} id="qr-scanner-video" class="w-full bg-slate-900">
				<track kind="captions" src="" label="Camera feed" />
			</video>
			<!-- Overlay canvas for QR detection visualization -->
			<canvas
				bind:this={overlayCanvas}
				class="absolute top-0 left-0 w-full h-full pointer-events-none"
			></canvas>
			<button
				type="button"
				class="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white rounded-lg p-2"
				onclick={() => toggleScanner(false)}
				aria-label="Close scanner"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-6 h-6"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		{#if errorMessage}
			<div use:scrollIntoView class="mt-2 text-red-500 text-sm text-center" transition:scale>
				{errorMessage}
			</div>
		{/if}

		{#if showSuccessMessage}
			<div use:scrollIntoView class="mt-2 text-green-500 text-sm text-center" transition:scale>
				{successMessage}
			</div>
		{/if}

		<p class="text-center mt-2 text-sm text-gray-600 dark:text-slate-400">
			Position a QR code in front of your camera to scan it
		</p>
	</div>
{/if}
