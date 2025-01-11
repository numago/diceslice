import { generateShares, reconstructSecret } from '$lib/secretSharing/sss'
import { beforeEach, describe, expect, it } from 'vitest'

describe('secretSharing module', () => {
	let secret: number
	let threshold: number
	let numShares: number

	beforeEach(() => {
		secret = 42
		threshold = 3
		numShares = 4
	})

	it('should reconstruct the secret from the shares', () => {
		const shares = generateShares(secret, threshold, numShares)
		const reconstructedSecret = reconstructSecret(shares, threshold)

		expect(reconstructedSecret).toBe(secret)
	})
})
