import { concatArrayBuffers, deserializeUint8, uint8ArrayView, serializeUint8, uint8ArraySubView } from './bufferUtils'
import { SerializationError } from '../errors'
import type { Share, Slice } from '$lib/secretSharing'
import { AES_KEY_BYTE_SIZE } from '$lib/webCrypto'

export type SliceFileHeader = {
	version: number
	threshold: number
	keySlice: Slice
}

export const KEY_SLICE_SIZE = AES_KEY_BYTE_SIZE * 2

const VERSION_OFFSET = 0
const VERSION_SIZE = 1
const THRESHOLD_OFFSET = VERSION_OFFSET + VERSION_SIZE
const THRESHOLD_SIZE = 1
const KEY_SLICE_OFFSET = THRESHOLD_OFFSET + THRESHOLD_SIZE

export const HEADER_SIZE = KEY_SLICE_OFFSET + KEY_SLICE_SIZE

export function serializeHeader(sliceHeader: SliceFileHeader): ArrayBuffer {
	const versionBuffer = serializeUint8(sliceHeader.version)
	const thresholdBuffer = serializeUint8(sliceHeader.threshold)
	const keySliceBuffer = serializeKeySlice(sliceHeader.keySlice)

	return concatArrayBuffers(versionBuffer, thresholdBuffer, keySliceBuffer)
}

export function deserializeHeader(sliceBuffer: Uint8Array): SliceFileHeader {
	const version: number = deserializeUint8(sliceBuffer, VERSION_OFFSET)
	const threshold: number = deserializeUint8(sliceBuffer, THRESHOLD_OFFSET)
	const keySliceView = uint8ArraySubView(sliceBuffer, KEY_SLICE_OFFSET, KEY_SLICE_SIZE)
	const keySlice: Slice = deserializeKeySlice(keySliceView)

	return { version, threshold, keySlice }
}

export function deserializeKeySlice(keySliceView: Uint8Array): Slice {
	if (keySliceView.byteLength !== KEY_SLICE_SIZE) {
		throw new SerializationError(
			`Invalid slice key byte length: expected ${KEY_SLICE_SIZE} bytes, got ${keySliceView.byteLength}`
		)
	}
	const keySliceLength = keySliceView.byteLength / 2
	const keySlice: Slice = Array.from(
		{ length: keySliceLength },
		(_, i) => [keySliceView[i * 2], keySliceView[i * 2 + 1]] as Share
	)
	return keySlice
}

export function serializeKeySlice(keySlice: Slice): ArrayBuffer {
	if (keySlice.length * 2 !== KEY_SLICE_SIZE) {
		throw new SerializationError(
			`Invalid key slice length: expected ${KEY_SLICE_SIZE / 2} shares, got ${keySlice.length}`
		)
	}
	const keySliceBuffer = new Uint8Array(keySlice.flat()).buffer
	return keySliceBuffer
}
