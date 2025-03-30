import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
	svgToPng,
	scanImageForQRCode,
	processQRCodeData,
	createQrCode,
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

	describe('createQrCode', () => {
		it('should create a QR code from small data', async () => {
			const result = await createQrCode(smallTestData.buffer)
			expect(result).toBeInstanceOf(Blob)
			expect(result).not.toBeNull()
			expect(result?.type).toBe('image/png')
		})

		it('should accept custom dimensions', async () => {
			const customDimension = 512
			const result = await createQrCode(smallTestData.buffer, customDimension)
			expect(result).toBeInstanceOf(Blob)
			expect(result).not.toBeNull()
		})

		it('should return null for data exceeding MAX_QR_SECRET_SIZE', async () => {
			// Create a buffer larger than MAX_QR_SECRET_SIZE
			const largeBuffer = new Uint8Array(MAX_QR_SECRET_SIZE + 10).fill(1).buffer
			const result = await createQrCode(largeBuffer)
			expect(result).toBeNull()
		})

		it('should handle empty data', async () => {
			const emptyBuffer = new Uint8Array(0).buffer
			const result = await createQrCode(emptyBuffer)
			expect(result).toBeInstanceOf(Blob)
			expect(result).not.toBeNull()
		})
	})
})
