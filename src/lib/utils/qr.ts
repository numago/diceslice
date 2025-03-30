import { QRCanvas } from '@paulmillr/qr/dom.js'
import encodeQR from '@paulmillr/qr'

/**
 * Converts an SVG string to a PNG blob
 * @param svgString The SVG content as a string
 * @param width The width of the output PNG
 * @param height The height of the output PNG
 * @returns A Promise that resolves to a PNG Blob
 * @throws Error if conversion fails
 */
export async function svgToPng(svgString: string, width: number, height: number): Promise<Blob> {
	const svgBlob = new Blob([svgString], { type: 'image/svg+xml' })
	const svgUrl = URL.createObjectURL(svgBlob)

	try {
		const img = await new Promise<HTMLImageElement>((resolve, reject) => {
			const img = new Image()
			img.onload = () => resolve(img)
			img.onerror = () => reject(new Error('Failed to load SVG image'))
			img.src = svgUrl
		})

		const canvas = document.createElement('canvas')
		canvas.width = width
		canvas.height = height

		const ctx = canvas.getContext('2d')
		if (!ctx) {
			throw new Error('Could not get canvas context')
		}
		ctx.fillStyle = 'white'
		ctx.fillRect(0, 0, width, height)
		ctx.drawImage(img, 0, 0, width, height)

		const blob = await new Promise<Blob>((resolve, reject) => {
			canvas.toBlob((blob) => {
				blob ? resolve(blob) : reject(new Error('Failed to create PNG blob'))
			}, 'image/png')
		})

		return blob
	} finally {
		URL.revokeObjectURL(svgUrl)
	}
}

/**
 * Scans an image URL for QR code content
 * @param imageUrl URL of the image to scan
 * @returns Promise resolving to the QR code data or null if none found
 */
export async function scanImageForQRCode(imageUrl: string): Promise<string | null> {
	const img = new Image()

	try {
		await new Promise<void>((resolve, reject) => {
			img.onload = () => resolve()
			img.onerror = () => reject(new Error('Failed to load image'))
			img.src = imageUrl
		})

		const qrCanvas = new QRCanvas()
		const qrData = qrCanvas.drawImage(img, img.width, img.height)
		qrCanvas.clear()

		return qrData || null
	} finally {
		URL.revokeObjectURL(imageUrl)
	}
}

/**
 * Processes QR code data into a File object
 * @param qrData The raw QR code data string
 * @param filename Desired filename for the output File
 * @returns File object containing the binary data from the QR code
 * @throws Error if QR data cannot be processed
 */
export function processQRCodeData(qrData: string, filename: string): File {
	try {
		const binaryData = Uint8Array.from(qrData, (char) => char.charCodeAt(0))
		return new File([binaryData], filename, { type: 'application/octet-stream' })
	} catch (error) {
		throw new Error('Invalid QR code data format')
	}
}

export const QR_VERSION = 20
export const QR_ERROR_CORRECTION = 'medium'
export const MAX_QR_SECRET_SIZE = 255 // Empirically determined for QRv20M with @paulmillr/qr

/**
 * Creates a QR code PNG image from a slice file buffer
 * @param buffer ArrayBuffer containing slice file data
 * @param pngDimensions Width and height of the output PNG image (defaults to 1024)
 * @returns Promise resolving to a PNG Blob or null if generation fails
 */
export async function createQrCode(
	buffer: ArrayBuffer,
	pngDimensions = 1024
): Promise<Blob | null> {
	try {
		if (buffer.byteLength > MAX_QR_SECRET_SIZE) {
			return null
		}

		const bufferView = new Uint8Array(buffer)
		const qrPayload = String.fromCharCode(...bufferView)

		const svgString = encodeQR(qrPayload, 'svg', {
			version: QR_VERSION,
			ecc: QR_ERROR_CORRECTION
		})

		const pngBlob = await svgToPng(svgString, pngDimensions, pngDimensions)
		return pngBlob
	} catch (error) {
		return null
	}
}
