export function bytesToSizeString(bytes: number): string {
	const units = ['Bytes', 'KB', 'MB', 'GB', 'TB']
	if (bytes === 0) return '0 Bytes'
	if (bytes === 1) return '1 Byte'
	const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024))
	const clampedIndex = Math.min(units.length - 1, Math.max(0, unitIndex))
	const roundedValue = Math.round(bytes / Math.pow(1024, clampedIndex))
	return `${roundedValue} ${units[clampedIndex]}`
}
