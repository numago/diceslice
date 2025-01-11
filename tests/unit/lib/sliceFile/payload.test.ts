import { encryptAndSerializePayload, decryptAndDeserializePayload } from '$lib/sliceFile/payload'
import type { SliceFilePayload } from '$lib/sliceFile'
import { generateAESKey } from '$lib/webCrypto'
import { beforeEach, describe, expect, it } from 'vitest'
import { uint8ArrayView } from '$lib/sliceFile/bufferUtils'

describe('slicePayload module', () => {
	let cryptoKey: CryptoKey
	let plaintext: string
	let data: Uint8Array
	let metadata: { filename: string }

	beforeEach(async () => {
		plaintext = 'This is the plaintext.'
		data = new TextEncoder().encode(plaintext)
		metadata = { filename: 'file.txt' }
		cryptoKey = await generateAESKey()
	})

	it('should encrypt and decrypt payload with metadata', async () => {
		const payload: SliceFilePayload = {
			data,
			metadata
		}

		const encryptedBuffer = await encryptAndSerializePayload(payload, cryptoKey)
		const decryptedData = await decryptAndDeserializePayload(
			uint8ArrayView(encryptedBuffer),
			cryptoKey
		)

		expect(decryptedData.metadata.filename).toEqual('file.txt')
		expect(new Uint8Array(decryptedData.data)).toEqual(data)
		expect(new TextDecoder().decode(decryptedData.data)).toEqual(plaintext)
	})

	it('should encrypt and decrypt payload without metadata', async () => {
		const originalData: SliceFilePayload = {
			data,
			metadata: {}
		}

		const encryptedBuffer = await encryptAndSerializePayload(originalData, cryptoKey)
		const decryptedData = await decryptAndDeserializePayload(
			uint8ArrayView(encryptedBuffer),
			cryptoKey
		)

		expect(decryptedData.metadata).toEqual({})
		expect(new Uint8Array(decryptedData.data)).toEqual(data)
		expect(new TextDecoder().decode(decryptedData.data)).toEqual(plaintext)
	})
})
