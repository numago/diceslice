import type { Share, Slice } from '$lib/secretSharing/types'
import { createAttachedSliceFile, createEncryptedPayloadBuffer, getHeader, decryptPayload, getEncryptedPayload } from '$lib/sliceFile'
import { KEY_SLICE_SIZE, type SliceFileHeader } from '$lib/sliceFile/header'
import type { SliceFilePayload } from '$lib/sliceFile/payload'
import { generateAESKey } from '$lib/webCrypto'
import { describe, it, expect, beforeEach } from 'vitest'

describe('sliceBufferManager module', () => {
	let cryptoKey: CryptoKey
	let version: number
	let threshold: number
	let sliceKey: Slice
	let data: Uint8Array
	let metadata: Record<string, any>

	beforeEach(async () => {
		cryptoKey = await generateAESKey()
		version = 1
		threshold = 3
		sliceKey = Array.from({ length: KEY_SLICE_SIZE / 2 }, (_, i) => [i, i + 1] as Share)
		data = new Uint8Array([27, 4, 5, 6, 7])
		metadata = { filename: 'test.file', date: '2023-06-15T10:30:00Z' }
	})

	it('should create and retrieve slice buffer data', async () => {
		const sliceHeader: SliceFileHeader = { version, threshold, keySlice: sliceKey }
		const slicePayload: SliceFilePayload = { metadata, data }

		// Create encrypted payload buffer
		const encryptedPayloadBuffer = await createEncryptedPayloadBuffer(slicePayload, cryptoKey)
		
		// Create attached slice file with header and encrypted payload
		const sliceBuffer = await createAttachedSliceFile(sliceHeader, encryptedPayloadBuffer)
		
		// Verify header can be retrieved correctly
		const actualHeader = getHeader(sliceBuffer)
		expect(actualHeader).toEqual(sliceHeader)
		
		// Get and decrypt payload
		const encryptedPayload = await getEncryptedPayload(sliceBuffer)
		const actualPayload = await decryptPayload(encryptedPayload, cryptoKey)
		
		// Verify payload data and metadata
		expect(actualPayload.data).toEqual(data)
		expect(actualPayload.metadata).toEqual(metadata)
	})
	
	it('should handle empty metadata in payload', async () => {
		const sliceHeader: SliceFileHeader = { version, threshold, keySlice: sliceKey }
		const emptyMetadataPayload: SliceFilePayload = { metadata: {}, data }

		// Create encrypted payload buffer
		const encryptedPayloadBuffer = await createEncryptedPayloadBuffer(emptyMetadataPayload, cryptoKey)
		
		// Create attached slice file with header and encrypted payload
		const sliceBuffer = await createAttachedSliceFile(sliceHeader, encryptedPayloadBuffer)
		
		// Get and decrypt payload
		const encryptedPayload = await getEncryptedPayload(sliceBuffer)
		const actualPayload = await decryptPayload(encryptedPayload, cryptoKey)
		
		// Verify empty metadata is preserved
		expect(actualPayload.data).toEqual(data)
		expect(actualPayload.metadata).toEqual({})
	})
})
