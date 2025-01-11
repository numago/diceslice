import type { Share, Slice } from '$lib/secretSharing/types'
import { createBuffer, getDecryptedPayload, getHeader } from '$lib/sliceFile'
import { KEY_SLICE_SIZE, type SliceFileHeader } from '$lib/sliceFile/header'
import type { SliceFilePayload } from '$lib/sliceFile/payload'
import { generateAESKey } from '$lib/webCrypto'
import * as vitest from 'vitest'

vitest.describe('sliceBufferManager module', () => {
	let cryptoKey: CryptoKey
	let version: number
	let threshold: number
	let sliceKey: Slice
	let data: Uint8Array

	vitest.beforeEach(async () => {
		cryptoKey = await generateAESKey()
		version = 1
		threshold = 3
		sliceKey = Array.from({ length: KEY_SLICE_SIZE / 2 }, (_, i) => [i, i + 1] as Share)
		data = new Uint8Array([27, 4, 5, 6, 7])
	})

	vitest.it('should create and retrieve slice buffer data', async () => {
		const sliceHeader: SliceFileHeader = { version, threshold, keySlice: sliceKey }
		const slicePayload: SliceFilePayload = { metadata: {}, data }

		const sliceBuffer: ArrayBuffer = await createBuffer(sliceHeader, slicePayload, cryptoKey)
		const actualHeader = getHeader(sliceBuffer)
		const actualPayload = await getDecryptedPayload(sliceBuffer, cryptoKey)

		vitest.expect(actualHeader).toEqual(sliceHeader)
		vitest.expect(actualPayload).toEqual(slicePayload)
	})
})
