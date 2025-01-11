export default function transpose<T>(matrix: T[][]): T[][] {
	const numRows = matrix.length
	const numCols = matrix[0]?.length ?? 0

	if (matrix.some((row) => row.length !== numCols)) {
		throw new Error(`Input matrix has irregular dimensions.`)
	}

	if (numRows === 0 || numCols === 0) {
		throw new Error('Input matrix must have at least one row and one column.')
	}

	return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]))
}
