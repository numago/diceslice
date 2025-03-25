import { CryptoError } from '$lib/errors'
import { AES_IV_BYTE_SIZE, ENCRYPTION_ALGORITHM, GCM_AUTH_TAG_BIT_SIZE } from './constants'
import type { EncryptedData } from './types'

export async function encryptData(key: CryptoKey, plaintext: BufferSource): Promise<EncryptedData> {
	try {
		const iv = globalThis.crypto.getRandomValues(new Uint8Array(AES_IV_BYTE_SIZE))
		const ciphertext: ArrayBuffer = await globalThis.crypto.subtle.encrypt(
			{
				name: ENCRYPTION_ALGORITHM,
				iv,
				tagLength: GCM_AUTH_TAG_BIT_SIZE
			},
			key,
			plaintext
		)
		return { 
			iv: new Uint8Array(iv), 
			ciphertext: new Uint8Array(ciphertext) 
		}
	} catch (error) {
		throw new CryptoError('Could not encrypt data.')
	}
}

export async function decryptData(
	key: CryptoKey,
	{ iv, ciphertext }: EncryptedData
): Promise<ArrayBuffer> {
	try {
		const plaintext: ArrayBuffer = await globalThis.crypto.subtle.decrypt(
			{
				name: ENCRYPTION_ALGORITHM,
				iv,
				tagLength: GCM_AUTH_TAG_BIT_SIZE
			},
			key,
			ciphertext
		)
		return plaintext
	} catch (error) {
		throw new CryptoError('Could not decrypt data.')
	}
}
