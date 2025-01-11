import transpose from '$lib/secretSharing/transpose'
import { describe, it, expect } from 'vitest'

// Test transpose function
describe('transpose', () => {
	it('should transpose a matrix correctly', () => {
		const matrix = [
			[1, 2, 3],
			[4, 5, 6]
		]
		const transposedMatrix = transpose(matrix)
		expect(transposedMatrix).toEqual([
			[1, 4],
			[2, 5],
			[3, 6]
		])
	})

	it('should throw an error for irregular dimensions', () => {
		const matrix = [
			[1, 2, 3],
			[4, 5]
		]
		expect(() => transpose(matrix)).toThrowError('Input matrix has irregular dimensions.')
	})

	it('should throw an error for an empty matrix', () => {
		const matrix: number[][] = []
		expect(() => transpose(matrix)).toThrowError(
			'Input matrix must have at least one row and one column.'
		)
	})
})
