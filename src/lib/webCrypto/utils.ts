export function randomNumberGF256(): number {
	const randomByteArray = globalThis.crypto.getRandomValues(new Uint8Array(1))
	const byteValue = randomByteArray[0]
	return byteValue
}
