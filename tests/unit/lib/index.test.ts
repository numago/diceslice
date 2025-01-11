import { describe, it, expect, beforeEach } from 'vitest'
import { generateSliceFileBuffers, assembleSecretPayload } from '$lib'
import { SecretAssemblyError, SecretSharingError, InsufficientSlicesError, InconsistentThresholdError, InvalidThresholdError, InvalidShareCountError } from '$lib/errors'

describe('main module', () => {
	let plaintext: string
	let data: Uint8Array
	let threshold: number
	let sliceCount: number
	let metadata: { filename: string; date: string }

	beforeEach(() => {
		plaintext = 'Hello, World!'
		data = new Uint8Array(new TextEncoder().encode(plaintext))
		metadata = { filename: 'file.txt', date: new Date().toISOString() }
		threshold = 2
		sliceCount = 3
	})

	it('generates correct number of slices and reassembles payload accurately', async () => {
		const sliceFiles = await generateSliceFileBuffers(threshold, sliceCount, { metadata, data })
		const payload = await assembleSecretPayload(sliceFiles)

		expect(sliceFiles).toHaveLength(sliceCount)
		expect(payload).toBeDefined()
		expect(payload.metadata).toEqual(metadata)
		expect(new TextDecoder().decode(payload.data)).toBe(plaintext)
	})

	it('handles empty data correctly', async () => {
		const sliceFiles = await generateSliceFileBuffers(threshold, sliceCount, {
			metadata: {},
			data: new Uint8Array(0)
		})
		const output = await assembleSecretPayload(sliceFiles)

		expect(sliceFiles).toHaveLength(sliceCount)
		expect(output).toBeDefined()
		expect(output.metadata).toEqual({})
		expect(new TextDecoder().decode(output.data)).toBe('')
	})

	it('throws InsufficientSlicesError if less than 2 slice files are provided during assembly', async () => {
		const sliceFiles = await generateSliceFileBuffers(threshold, sliceCount, { metadata, data })
		const insufficientSlices = sliceFiles.slice(0, 1)

		await expect(assembleSecretPayload(insufficientSlices)).rejects.toThrow(InsufficientSlicesError)
	})

	it('throws InsufficientSlicesError if slice files provided are less than the threshold', async () => {
		const sliceFiles = await generateSliceFileBuffers(threshold, sliceCount, { metadata, data })
		const insufficientSlices = sliceFiles.slice(0, threshold - 1)

		await expect(assembleSecretPayload(insufficientSlices)).rejects.toThrow(InsufficientSlicesError)
	})

	it('throws InconsistentThresholdError if slice files have inconsistent thresholds', async () => {
		const sliceFiles = await generateSliceFileBuffers(threshold, sliceCount, { metadata, data })
		const tamperedSliceFile = new DataView(sliceFiles[0])
		tamperedSliceFile.setUint8(1, tamperedSliceFile.getUint8(1) + 1)

		await expect(assembleSecretPayload(sliceFiles)).rejects.toThrow(InconsistentThresholdError)
	})

	it('throws InvalidShareCountError on invalid share count', async () => {
		const invalidCount = 1
		await expect(
			generateSliceFileBuffers(threshold, invalidCount, { metadata, data })
		).rejects.toThrow(InvalidShareCountError)
	})

	it('generates and reassembles payload with non-UTF8 binary data', async () => {
		const binaryData = new Uint8Array([0xff, 0xfe, 0xfd]) // Non-UTF8 data
		const sliceFiles = await generateSliceFileBuffers(threshold, sliceCount, {
			metadata,
			data: binaryData
		})
		const payload = await assembleSecretPayload(sliceFiles)

		expect(sliceFiles).toHaveLength(sliceCount)
		expect(payload).toBeDefined()
		expect(payload.metadata).toEqual(metadata)
		expect(payload.data).toEqual(binaryData)
	})

	it('handles maximum threshold equal to slice count', async () => {
		const maxThreshold = sliceCount
		const sliceFiles = await generateSliceFileBuffers(maxThreshold, sliceCount, { metadata, data })
		const payload = await assembleSecretPayload(sliceFiles)

		expect(sliceFiles).toHaveLength(sliceCount)
		expect(payload).toBeDefined()
		expect(payload.metadata).toEqual(metadata)
		expect(new TextDecoder().decode(payload.data)).toBe(plaintext)
	})

	it('throws InvalidThresholdError if threshold is less than 2', async () => {
		await expect(generateSliceFileBuffers(1, 3, { metadata, data }))
			.rejects.toThrow(InvalidThresholdError);
	});

	it('throws InvalidShareCountError if count is less than threshold', async () => {
		await expect(generateSliceFileBuffers(3, 2, { metadata, data }))
			.rejects.toThrow(InvalidShareCountError);
	});
})
