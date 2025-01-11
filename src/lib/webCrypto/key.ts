import { CryptoError } from '$lib/errors'
import { AES_KEY_BYTE_SIZE, ENCRYPTION_ALGORITHM } from './constants'

export async function generateAESKey(): Promise<CryptoKey> {
	const keyBitLength = 8 * AES_KEY_BYTE_SIZE
	try {
		const key = await globalThis.crypto.subtle.generateKey(
			{
				name: ENCRYPTION_ALGORITHM,
				length: keyBitLength
			},
			true,
			['encrypt', 'decrypt']
		)
		return key
	} catch (error) {
		throw new CryptoError('Could not generate AES key.')
	}
}

export async function exportRawKey(key: CryptoKey): Promise<Uint8Array> {
	try {
		const exportedKeyBuffer: ArrayBuffer = await globalThis.crypto.subtle.exportKey('raw', key)
		return new Uint8Array(exportedKeyBuffer)
	} catch (error) {
		throw new CryptoError('Could not export key as bytes array.')
	}
}

export async function importAESKey(buffer: BufferSource): Promise<CryptoKey> {
	if (buffer.byteLength !== AES_KEY_BYTE_SIZE) {
		throw new CryptoError(
			`Invalid key size: expected ${AES_KEY_BYTE_SIZE} bytes, got ${buffer.byteLength} bytes.`
		)
	}
	try {
		const importedKey: CryptoKey = await globalThis.crypto.subtle.importKey(
			'raw',
			buffer,
			{ name: ENCRYPTION_ALGORITHM },
			true,
			['encrypt', 'decrypt']
		)
		return importedKey
	} catch (error) {
		throw new CryptoError('Could not import AES key.')
	}
}
