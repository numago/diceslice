export function isWebCryptoSupported(): boolean {
	const isSupported = globalThis.crypto?.subtle !== undefined

	if (!isSupported) {
		console.error(
			'Web Crypto API is not supported in the runtime environment. Note: Web Crypto API is available only in secure contexts (HTTPS), in some or all supporting browsers.'
		)
	}

	return isSupported
}

export function randomNumberGF256(): number {
	const randomByteArray = globalThis.crypto.getRandomValues(new Uint8Array(1))
	const byteValue = randomByteArray[0]
	return byteValue
}
