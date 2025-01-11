import type { Slice } from './types'
import transpose from './transpose'
import { generateShares, reconstructSecret } from './sss'
import { SecretSharingError } from '$lib/errors'

async function generateSlices(
	secretBytesView: Uint8Array,
	threshold: number,
	count: number
): Promise<Slice[]> {
	try {
		const sharesPerByte = Array.from(secretBytesView, (byte) =>
			generateShares(byte, threshold, count)
		)
		const slices = transpose(sharesPerByte)
		return slices
	} catch (error) {
		throw new SecretSharingError('Failed to generate slices from secret.')
	}
}

async function assembleSecretFromSlices(slices: Slice[], threshold: number): Promise<Uint8Array> {
	try {
		const sharesPerByte = transpose(slices)
		const secret = Uint8Array.from(sharesPerByte, (shares) => reconstructSecret(shares, threshold))
		return secret
	} catch (error) {
		throw new SecretSharingError('Failed to assemble secret from slices.')
	}
}

export { generateSlices, assembleSecretFromSlices }
export * from './types'
