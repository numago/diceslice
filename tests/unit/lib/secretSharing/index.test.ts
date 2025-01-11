import { generateSlices, assembleSecretFromSlices } from '$lib/secretSharing'
import { beforeEach, describe, expect, it } from 'vitest'

describe('secretSharing module', () => {
	let secret: Uint8Array
	let threshold: number
	let numShares: number

	beforeEach(() => {
		secret = new Uint8Array([42, 4, 3, 0, 0])
		threshold = 3
		numShares = 4
	})

	it('should reconstruct the secret from the shares', async () => {
		const keySlices = await generateSlices(secret, threshold, numShares)
		const reconstructedSecret = await assembleSecretFromSlices(keySlices, threshold)

		expect(reconstructedSecret).toEqual(secret)
	})
})
