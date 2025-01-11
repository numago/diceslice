import { checkGF256Range, addGF256, divGF256, mulGF256, subGF256 } from './gf256'
import { randomNumberGF256 } from '$lib/webCrypto'
import { type Share } from './types'

type Coefficients = number[]

const FINITE_FIELD_ORDER = 256 // GF(2^8)

// Generates secret shares using Shamir's Secret Sharing Scheme
export function generateShares(secret: number, threshold: number, numShares: number): Share[] {
	assertValidGenerationParams(secret, threshold, numShares)

	const degree = threshold - 1

	// Generate random coefficients for the polynomial, with the secret as the constant term
	const randomCoefficients = Array.from({ length: degree }, randomNumberGF256)
	const coefficients: Coefficients = [secret, ...randomCoefficients]

	// Generate indices for shares, excluding 0 (which would reveal the secret)
	const shareIndices = Array.from({ length: numShares }, (_, i) => i + 1)

	// Evaluate the polynomial for each index x to construct shares
	const shares: Share[] = shareIndices.map((x: number) => {
		const y = evalPolynomialAt(coefficients, x)
		return [x, y] as Share
	})

	return shares
}

// Reconstructs the secret from a given set of shares using Lagrange interpolation
export function reconstructSecret(shares: Share[], threshold: number): number {
	if (shares.length < threshold) {
		throw new Error(`Insufficient shares to reconstruct the secret, must be at least ${threshold}`)
	} else if (!sharesAreUnique(shares)) {
		throw new Error('Provided shares are not unique')
	}

	// Use only the minimum number of shares required for reconstruction
	const thresholdShares = shares.slice(0, threshold)
	const secret = lagrangeInterpolate(0, thresholdShares)
	return secret
}

// Evaluates a polynomial for a given point x
function evalPolynomialAt(coefficients: Coefficients, x: number): number {
	let y = 0
	let term = 1

	for (const coef of coefficients) {
		y = addGF256(y, mulGF256(coef, term))
		term = mulGF256(term, x)
	}

	return y
}

// Reconstructs the secret from a given set of shares using Lagrange interpolation
function lagrangeInterpolate(x: number, shares: Share[]): number {
	const interpolatedValue = shares.reduce((accumulator, [xi, yi]) => {
		let numerator = 1
		let denominator = 1

		// Construct Lagrange basis polynomials
		for (let [xj, _] of shares) {
			if (xi !== xj) {
				numerator = mulGF256(numerator, subGF256(x, xj))
				denominator = mulGF256(denominator, subGF256(xi, xj))
			}
		}

		// Combine terms to get the interpolated value
		const term = mulGF256(yi, divGF256(numerator, denominator))
		return addGF256(accumulator, term)
	}, 0)

	return interpolatedValue
}

// Validates the input parameters for share generation
function assertValidGenerationParams(secret: number, threshold: number, numShares: number): void {
	checkGF256Range(secret)

	if (threshold < 2 || threshold > numShares) {
		throw new RangeError(
			`Threshold: ${threshold} is must be at least 2 and cannot exceed the number of shares: ${numShares}.`
		)
	}
	if (numShares < 2 || numShares >= FINITE_FIELD_ORDER - 1) {
		throw new RangeError(
			`Number of shares: ${numShares}, must be in the range [2, ${FINITE_FIELD_ORDER}).`
		)
	}
}

function sharesAreUnique(shares: Share[]): boolean {
	const shareKeys = shares.map(([x, y]) => `${x}-${y}`)
	const seen = new Set(shareKeys)
	return seen.size === shares.length
}
