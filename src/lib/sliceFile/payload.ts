import { initWorker } from '$lib/worker/initWorker'
import {
	deserializeString,
	concatBuffers,
	deserializeUint16,
	serializeString,
	serializeUint16,
	uint8ArraySubView,
	uint8ArrayView
} from './bufferUtils'
import { SerializationError } from '$lib/errors'
import { AES_IV_BYTE_SIZE, type EncryptedData } from '$lib/webCrypto'

export interface SliceFilePayload {
	metadata: SliceFileMetadata
	data: Uint8Array
}

export interface SliceFileMetadata {
	filename?: string
	date?: string
}

const IV_OFFSET = 0
const IV_SIZE = AES_IV_BYTE_SIZE
const CIPHERTEXT_OFFSET = IV_SIZE
const METADATA_LENGTH_PREFIX_SIZE = 2 // 16-bits unsigned integer to indicate byte length of metadata
const MAX_METADATA_BYTE_LENGTH = 65535 // = 2^16-1: the maximum value of 2 bytes

export async function encryptAndSerializePayload(
	payload: SliceFilePayload,
	cryptoKey: CryptoKey
): Promise<ArrayBuffer> {
	const { workerApi, terminateWorker } = initWorker()

	try {
		const payloadBuffer: ArrayBuffer = serializePayload(payload)
		const encryptedPayload: EncryptedData = await workerApi.encryptData(cryptoKey, payloadBuffer)
		return serializeEncryptedData(encryptedPayload)
	} finally {
		terminateWorker()
	}
}

export async function decryptAndDeserializePayload(
	view: Uint8Array,
	cryptoKey: CryptoKey
): Promise<SliceFilePayload> {
	const { workerApi, terminateWorker } = initWorker()

	try {
		const encryptedPayload: EncryptedData = deserializeEncryptedData(view)
		const payloadBuffer: ArrayBuffer = await workerApi.decryptData(cryptoKey, encryptedPayload)
		return deserializePayload(payloadBuffer)
	} finally {
		terminateWorker()
	}
}

function serializeEncryptedData({ iv, ciphertext }: EncryptedData): ArrayBuffer {
	return concatBuffers(iv, ciphertext)
}

function deserializeEncryptedData(view: Uint8Array): EncryptedData {
	const iv = uint8ArraySubView(view, IV_OFFSET, IV_SIZE)
	const ciphertext = uint8ArraySubView(view, CIPHERTEXT_OFFSET)
	return { iv, ciphertext }
}

function serializePayload(payload: SliceFilePayload): ArrayBuffer {
	const metadataBuffer = serializeMetadata(payload.metadata)
	return concatBuffers(metadataBuffer, payload.data)
}

function deserializePayload(payloadBuffer: ArrayBuffer): SliceFilePayload {
	const { metadata, byteLength: dataOffset } = deserializeMetadata(payloadBuffer)
	const data = uint8ArrayView(payloadBuffer, dataOffset)
	return { metadata, data }
}

function serializeMetadata(metadata: SliceFileMetadata): ArrayBuffer {
	const metadataJsonString = JSON.stringify(metadata)
	const metadataBuffer = serializeString(metadataJsonString)

	if (metadataBuffer.byteLength > MAX_METADATA_BYTE_LENGTH) {
		throw new SerializationError(
			`Encoded metadata byte length of ${metadataBuffer.byteLength} bytes exceeds the maximum limit of ${MAX_METADATA_BYTE_LENGTH} bytes.`
		)
	}

	const metadataSizePrefixBuffer = serializeUint16(metadataBuffer.byteLength)

	return concatBuffers(metadataSizePrefixBuffer, metadataBuffer)
}

function deserializeMetadata(payloadBuffer: ArrayBuffer): {
	metadata: SliceFileMetadata
	byteLength: number
} {
	const metadataSize = deserializeUint16(payloadBuffer, 0)
	const metadataView = uint8ArrayView(payloadBuffer, METADATA_LENGTH_PREFIX_SIZE, metadataSize)
	const metadataJsonString = deserializeString(metadataView)
	const metadata = JSON.parse(metadataJsonString)
	const byteLength = METADATA_LENGTH_PREFIX_SIZE + metadataSize

	return { metadata, byteLength }
}
