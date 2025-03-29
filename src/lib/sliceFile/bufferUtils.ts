// Concatenate multiple BufferSource objects into a single ArrayBuffer.
export function concatBuffers(...buffers: BufferSource[]): ArrayBuffer {
	const totalLength = buffers.reduce((acc, buffer) => acc + buffer.byteLength, 0)
	const result = new Uint8Array(totalLength)

	let offset = 0
	for (const buffer of buffers) {
		const uint8 = new Uint8Array(
			ArrayBuffer.isView(buffer) ? buffer.buffer : (buffer as ArrayBuffer),
			ArrayBuffer.isView(buffer) ? buffer.byteOffset : 0,
			buffer.byteLength
		)
		result.set(uint8, offset)
		offset += buffer.byteLength
	}

	return result.buffer
}

// Creates a subview of the given Uint8Array.
export function uint8ArraySubView(
	view: Uint8Array,
	offset: number = 0,
	length?: number
): Uint8Array {
	const start = offset
	const end = length !== undefined ? start + length : undefined
	return view.subarray(start, end)
}

// Creates a Uint8Array view on the given ArrayBuffer.
export function uint8ArrayView(
	buffer: ArrayBuffer,
	offset: number = 0,
	length?: number
): Uint8Array {
	return new Uint8Array(buffer, offset, length)
}

// Serializes an 8-bit unsigned integer into an ArrayBuffer.
export function serializeUint8(num: number): ArrayBuffer {
	return new Uint8Array([num]).buffer
}

// Retrieves a single 8-bit unsigned integer from the buffer at the given offset.
export function deserializeUint8(view: Uint8Array, offset: number = 0): number {
	return view[offset]
}

// Serializes a 16-bit unsigned integer into an ArrayBuffer.
export function serializeUint16(num: number): ArrayBuffer {
	return new Uint16Array([num]).buffer
}

// Retrieves a single 16-bit unsigned integer from the buffer at the given offset in little-endian order.
export function deserializeUint16(buffer: ArrayBuffer, offset: number = 0): number {
	return new DataView(buffer).getUint16(offset, true) // true for little-endian
}

// Converts an File object to an ArrayBuffer.
export async function serializeFile(input: File): Promise<ArrayBuffer> {
	return await input.arrayBuffer()
}

// Converts a string to an ArrayBuffer using UTF-8 encoding.
export function serializeString(str: string): Uint8Array {
	return new TextEncoder().encode(str)
}

// Converts an ArrayBuffer to a string using UTF-8 decoding.
export function deserializeString(source: BufferSource): string {
	return new TextDecoder('utf-8').decode(source)
}
