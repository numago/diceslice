import { describe, it, expect } from 'vitest'
import {
	addGF256,
	subGF256,
	mulGF256,
	divGF256,
	expGF256,
	logGF256,
	invGF256,
	checkGF256Range
} from '$lib/secretSharing/gf256'
import { GF256RangeError, GF256UndefinedOperationError } from '$lib/errors'

describe('gf256 module', () => {
	const x = 123
	const y = 87

	describe('addGF256 function', () => {
		it('should perform addition correctly', () => {
			expect(addGF256(5, 3)).toBe(6)
			expect(addGF256(7, 7)).toBe(0)
			expect(addGF256(0, 255)).toBe(255)
			expect(addGF256(255, 255)).toBe(0)
			expect(addGF256(12, 34)).toBe(addGF256(34, 12))
		})
	})

	describe('subGF256 function', () => {
		it('should perform subtraction correctly', () => {
			expect(subGF256(5, 3)).toBe(6)
			expect(subGF256(7, 7)).toBe(0)
			expect(subGF256(0, 255)).toBe(255)
			expect(subGF256(255, 255)).toBe(0)
			expect(subGF256(12, 34)).toBe(subGF256(34, 12))
		})
	})

	describe('mulGF256 function', () => {
		it('should perform multiplication correctly', () => {
			expect(mulGF256(3, 4)).toBe(12)
			expect(mulGF256(3, 0)).toBe(0)
			expect(mulGF256(255, 200)).toBe(99)
			expect(mulGF256(1, 200)).toBe(200)
			expect(mulGF256(12, 34)).toBe(mulGF256(34, 12))
		})
	})

	describe('divGF256 function', () => {
		it('should perform division correctly', () => {
			expect(divGF256(3, 4)).toBe(70)
			expect(divGF256(1, 255)).toBe(28)
			expect(divGF256(1, 1)).toBe(1)
			expect(mulGF256(divGF256(x, y), y)).toBe(x)
		})

		it('should throw error on division by zero', () => {
			expect(() => divGF256(5, 0)).toThrow(GF256UndefinedOperationError)
		})
	})

	describe('expGF256 function', () => {
		it('should perform exponentiation correctly', () => {
			expect(expGF256(5)).toBe(51)
			expect(expGF256(255)).toBe(1)
			expect(expGF256(0)).toBe(1)
			expect(expGF256(logGF256(x))).toBe(x)
		})
	})

	describe('logGF256 function', () => {
		it('should perform logarithm correctly', () => {
			expect(logGF256(3)).toBe(1)
			expect(logGF256(255)).toBe(7)
			expect(logGF256(expGF256(x))).toBe(x % 255)
		})

		it('should throw error on log of zero', () => {
			expect(() => logGF256(0)).toThrow(GF256UndefinedOperationError)
		})
	})

	describe('invGF256 function', () => {
		it('should perform inverse correctly', () => {
			expect(invGF256(3)).toBe(246)
			expect(invGF256(255)).toBe(28)
			expect(mulGF256(x, invGF256(x))).toBe(1)
		})

		it('should throw error on inverse of zero', () => {
			expect(() => invGF256(0)).toThrow(GF256UndefinedOperationError)
		})
	})

	describe('checkGF256Range function', () => {
		it('should validate range correctly', () => {
			expect(() => checkGF256Range(-1)).toThrow(GF256RangeError)
			expect(() => checkGF256Range(256)).toThrow(GF256RangeError)
			expect(() => checkGF256Range(0)).not.toThrow()
			expect(() => checkGF256Range(255)).not.toThrow()
		})
	})
})
