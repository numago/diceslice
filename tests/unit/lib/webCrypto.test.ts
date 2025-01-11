import { describe, it, expect } from 'vitest'
import {
	importAESKey,
	exportRawKey,
	encryptData,
	decryptData,
	generateAESKey
} from '$lib/webCrypto'
import { CryptoError } from '$lib/errors'

describe('webCrypto module', () => {
	describe('generateAESKey', () => {
		it('should generate a valid AES CryptoKey', async () => {
			const cryptoKey = await generateAESKey()
			expect(cryptoKey).toBeDefined()
			expect(cryptoKey.algorithm.name).toEqual('AES-GCM')
			expect(cryptoKey.usages).toContain('encrypt')
			expect(cryptoKey.usages).toContain('decrypt')
		})
	})

	describe('importAESKey and exportRawKey', () => {
		it('should convert a 32-byte array to a CryptoKey and back', async () => {
			const thirtyTwoBytes = new Uint8Array(32).map((_, i) => i + 1)
			const cryptoKey = await importAESKey(thirtyTwoBytes)
			const exportedBytes = await exportRawKey(cryptoKey)

			expect(thirtyTwoBytes.byteLength).toEqual(32)
			expect(exportedBytes).toEqual(thirtyTwoBytes)
		})

		it('should throw an error when trying to import a key of incorrect size', async () => {
			const invalidBytes = new Uint8Array(16)
			await expect(importAESKey(invalidBytes)).rejects.toThrow(CryptoError)
		})
	})

	describe('encryptData and decryptData', () => {
		it('should encrypt and decrypt data, returning the original input', async () => {
			const cryptoKey = await generateAESKey()
			const plaintext = new Uint8Array([42, 34, 12, 254])

			const { iv, ciphertext } = await encryptData(cryptoKey, plaintext)
			const actualPlaintext = await decryptData(cryptoKey, { iv, ciphertext })

			expect(new Uint8Array(actualPlaintext)).toEqual(plaintext)
		})

		it('should handle encryption/decryption of empty data', async () => {
			const cryptoKey = await generateAESKey()
			const plaintext = new Uint8Array([])

			const { iv, ciphertext } = await encryptData(cryptoKey, plaintext)
			const actualPlaintext = await decryptData(cryptoKey, { iv, ciphertext })

			expect(new Uint8Array(actualPlaintext)).toEqual(plaintext)
		})
	})
})
