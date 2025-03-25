import {
	concatArrayBuffers,
	deserializeString,
	serializeString,
	deserializeUint16,
	deserializeUint8,
	serializeUint16,
	uint8ArraySubView,
	uint8ArrayView,
	serializeUint8
} from '$lib/sliceFile/bufferUtils'
import { describe, expect, it } from 'vitest'

describe('bufferUtils module', () => {
	describe('concatArrayBuffers', () => {
		it('should concatenate multiple ArrayBuffer objects into a single ArrayBuffer', () => {
			const buf1 = new Uint8Array([1, 2, 3]).buffer
			const buf2 = new Uint8Array([4, 5, 6]).buffer
			const concatenated = concatArrayBuffers(buf1, buf2)

			expect(concatenated.byteLength).toBe(6)
			expect(new Uint8Array(concatenated)).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6]))
		})
	})

	describe('u8ArraySubView', () => {
		it('should create a subview of a Uint8Array', () => {
			const view = new Uint8Array([1, 2, 3, 4, 5])
			const subView = uint8ArraySubView(view, 1, 3)
			expect(subView).toEqual(new Uint8Array([2, 3, 4]))
		})
	})

	describe('u8ArrayView', () => {
		it('should create a Uint8Array view on an ArrayBuffer', () => {
			const buffer = new Uint8Array([1, 2, 3, 4, 5]).buffer
			const view = uint8ArrayView(buffer, 1, 3)
			expect(view).toEqual(new Uint8Array([2, 3, 4]))
		})
	})

	describe('deserializeUint8', () => {
		it('should retrieve a single 8-bit unsigned integer from the buffer', () => {
			const view = new Uint8Array([1, 2, 3])
			expect(deserializeUint8(view, 1)).toBe(2)
		})
	})

	describe('deserializeUint16', () => {
		it('should retrieve a single 16-bit unsigned integer from the buffer in little-endian order', () => {
			const buffer = new Uint16Array([258]).buffer // 258 = 0x0102 in little-endian
			expect(deserializeUint16(buffer)).toBe(258)
		})
	})

	describe('seralizeUint16', () => {
		it('should serialize a 16-bit unsigned integer into an ArrayBuffer', () => {
			const buffer = serializeUint16(258)
			expect(new Uint16Array(buffer)[0]).toBe(258)
		})
	})

	describe('serializeUint8', () => {
		it('should serialize an 8-bit unsigned integer into an ArrayBuffer', () => {
			const buffer = serializeUint8(3)
			expect(new Uint8Array(buffer)[0]).toBe(3)
		})
	})

	describe('serializeString', () => {
		it('should convert a string to an ArrayBuffer using UTF-8 encoding', () => {
			const buffer = serializeString('test')
			expect(deserializeString(buffer)).toBe('test')
		})
	})

	describe('deserializeString', () => {
		it('should convert an ArrayBuffer to a string using UTF-8 decoding', () => {
			const buffer = new TextEncoder().encode('test')
			expect(deserializeString(buffer)).toBe('test')
		})
	})
})
