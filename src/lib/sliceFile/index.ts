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

async function getDecryptedPayload(
	sliceFileBuffer: ArrayBuffer,
	cryptoKey: CryptoKey
): Promise<SliceFilePayload> {
	const encryptedPayloadView = uint8ArrayView(sliceFileBuffer, PAYLOAD_OFFSET)
	const payload = await decryptAndDeserializePayload(encryptedPayloadView, cryptoKey)
	return payload
}

async function createBuffer(
	header: SliceFileHeader,
	payload: SliceFilePayload,
	cryptoKey: CryptoKey
): Promise<ArrayBuffer> {
	const headerBuffer = serializeHeader(header)
	const encryptedPayloadBuffer = await encryptAndSerializePayload(payload, cryptoKey)
	const sliceFileBuffer = concatBuffers(headerBuffer, encryptedPayloadBuffer)
	return sliceFileBuffer
}

export { getHeader, getDecryptedPayload, createBuffer }
export * from './types'
