import { HEADER_SIZE, deserializeHeader, serializeHeader, type SliceFileHeader } from './header'
import {
	encryptAndSerializePayload,
	decryptAndDeserializePayload,
	type SliceFilePayload
} from './payload'
import { concatBuffers, uint8ArrayView } from './bufferUtils'

const PAYLOAD_OFFSET = HEADER_SIZE

function getHeader(sliceFileBuffer: ArrayBuffer): SliceFileHeader {
	const bufferView = uint8ArrayView(sliceFileBuffer, 0, HEADER_SIZE)
	return deserializeHeader(bufferView)
}

async function getEncryptedPayload(sliceFileBuffer: ArrayBuffer) {
	const encryptedPayloadView = uint8ArrayView(sliceFileBuffer, PAYLOAD_OFFSET)
	return encryptedPayloadView
}

async function decryptPayload(
	secret: Uint8Array,
	cryptoKey: CryptoKey
): Promise<SliceFilePayload> {
	const payload = await decryptAndDeserializePayload(secret, cryptoKey)
	return payload
}

async function createAttachedSliceFile(
	header: SliceFileHeader,
	encryptedPayloadBuffer: ArrayBuffer,
): Promise<ArrayBuffer> {
	const headerBuffer = serializeHeader(header)
	const sliceFileBuffer = concatBuffers(headerBuffer, encryptedPayloadBuffer)
	return sliceFileBuffer
}

async function createDetachedSliceFile(
	header: SliceFileHeader,
): Promise<ArrayBuffer> {
	const headerBuffer = serializeHeader(header)
	return headerBuffer
}

async function createEncryptedPayloadBuffer(
	payload: SliceFilePayload,
	cryptoKey: CryptoKey,
): Promise<ArrayBuffer> {
	const encryptedPayloadBuffer = await encryptAndSerializePayload(payload, cryptoKey)
	return encryptedPayloadBuffer
}

export {
	getHeader, 
	createAttachedSliceFile, 
	createDetachedSliceFile, 
	createEncryptedPayloadBuffer, 
	decryptPayload,
	getEncryptedPayload,
}
export * from './types'
