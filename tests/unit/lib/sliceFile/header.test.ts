import { describe, expect, it } from 'vitest'
import {
	serializeHeader,
	deserializeHeader,
	serializeKeySlice,
	deserializeKeySlice,
	KEY_SLICE_SIZE
} from '$lib/sliceFile/header'
import { SerializationError } from '$lib/errors'
import type { Share, Slice } from '$lib/secretSharing'

describe('sliceHeader module', () => {
	it('should serialize and deserialize a SliceHeader', () => {
		const originalHeader = {
			version: 1,
			threshold: 2,
			keySlice: Array.from({ length: KEY_SLICE_SIZE / 2 }, (_, i) => [i, i + 1] as Share)
		}

		const serializedHeader = serializeHeader(originalHeader)
		const deserializedHeader = deserializeHeader(new Uint8Array(serializedHeader))

		expect(deserializedHeader).toEqual(originalHeader)
	})

	it('should serialize and deserialize a SliceKey', () => {
		const originalSliceKey: Slice = Array.from(
			{ length: KEY_SLICE_SIZE / 2 },
			(_, i) => [i, i + 1] as Share
		)
		const serializedKey = serializeKeySlice(originalSliceKey)
		const deserializedKey: Slice = deserializeKeySlice(new Uint8Array(serializedKey))

		expect(deserializedKey).toEqual(originalSliceKey)
	})

	it('should throw SliceKeyError on deserializing SliceKey with incorrect size', () => {
		const incorrectSliceKeyView = new Uint8Array(KEY_SLICE_SIZE - 1)

		expect(() => deserializeKeySlice(incorrectSliceKeyView)).toThrow(SerializationError)
	})

	it('should throw SliceKeyError on serializing SliceKey with incorrect length', () => {
		const incorrectSliceKey = new Array(KEY_SLICE_SIZE / 2 - 1).fill([0, 1]) as Slice

		expect(() => serializeKeySlice(incorrectSliceKey)).toThrow(SerializationError)
	})
})
