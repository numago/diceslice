import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
	svgToPng,
	scanImageForQRCode,
	processQRCodeData,
	createQrCodes,
	MAX_QR_SECRET_SIZE
} from '$lib/utils/qr'

describe('QR module', () => {
	const validSvgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29 29"><path d="M0,0V29H29V0ZM1,1H28V28H1Z"/></svg>`
	const smallTestData = new Uint8Array([1, 2, 3, 4, 5])

	describe('svgToPng', () => {
		it('should convert an SVG string to a PNG blob', async () => {
			const result = await svgToPng(validSvgString, 100, 100)

			expect(result).toBeInstanceOf(Blob)
			expect(result.type).toBe('image/png')
			expect(result.size).toBeGreaterThan(0)
		})

		it('should throw an error if the SVG cannot be loaded', async () => {
			const invalidSvg = '<invalid>'

			await expect(svgToPng(invalidSvg, 100, 100)).rejects.toThrow()
		})
	})

	describe('scanImageForQRCode', () => {
		it('should return null for images without QR codes', async () => {
			const canvas = document.createElement('canvas')
			canvas.width = 100
			canvas.height = 100
			const context = canvas.getContext('2d')
			context?.fillRect(0, 0, 100, 100)
			const blankImageUrl = canvas.toDataURL()

			const result = await scanImageForQRCode(blankImageUrl)
			expect(result).toBeNull()
		})

		it('should throw an error if the image cannot be loaded', async () => {
			const invalidImageUrl = 'invalid-url'

			await expect(scanImageForQRCode(invalidImageUrl)).rejects.toThrow()
		})
	})

	describe('processQRCodeData', () => {
		it('should convert QR data to a File object with correct name and content', () => {
			const qrData = 'test data'
			const filename = 'test-file.bin'

			const result = processQRCodeData(qrData, filename)

			expect(result).toBeInstanceOf(File)
			expect(result.name).toBe(filename)
			expect(result.type).toBe('application/octet-stream')

			const reader = new FileReader()
			return new Promise<void>((resolve) => {
				reader.onload = () => {
					const buffer = reader.result as ArrayBuffer
					const view = new Uint8Array(buffer)
					const expectedView = new Uint8Array(qrData.split('').map((char) => char.charCodeAt(0)))
					expect(view).toEqual(expectedView)
					resolve()
				}
				reader.readAsArrayBuffer(result)
			})
		})

		it('should throw an error for invalid QR data', () => {
			const invalidData = null as unknown as string

			expect(() => processQRCodeData(invalidData, 'test.bin')).toThrow()
		})
	})

	describe('createQrCodes', () => {
		it('should create QR code blobs from slice buffers', async () => {
			const sliceBuffers = [new Blob([smallTestData]), new Blob([new Uint8Array([10, 20, 30])])]

			const result = await createQrCodes(sliceBuffers, 200)

			expect(result).toBeInstanceOf(Array)
			expect(result).toHaveLength(2)
			result?.forEach((blob) => {
				expect(blob).toBeInstanceOf(Blob)
				expect(blob.type).toBe('image/png')
				expect(blob.size).toBeGreaterThan(0)
			})
		})

		it('should return null for empty input array', async () => {
			const result = await createQrCodes([])
			expect(result).toBeNull()
		})

		it('should return null if buffer size exceeds maximum QR size', async () => {
			const largeArray = new Uint8Array(MAX_QR_SECRET_SIZE + 1)
			const largeBlob = new Blob([largeArray])

			const result = await createQrCodes([largeBlob])
			expect(result).toBeNull()
		})

		it('should produce valid QR code images with the specified dimensions', async () => {
			const testBlob = new Blob([smallTestData])
			const dimensions = 512

			const result = await createQrCodes([testBlob], dimensions)

			if (result === null) {
				throw new Error('QR codes generation failed')
			}

			const img = new Image()
			const blobUrl = URL.createObjectURL(result[0])

			return new Promise<void>((resolve) => {
				img.onload = () => {
					expect(img.width).toBe(dimensions)
					expect(img.height).toBe(dimensions)
					URL.revokeObjectURL(blobUrl)
					resolve()
				}
				img.src = blobUrl
			})
		})
	})
})
