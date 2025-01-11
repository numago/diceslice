export function scrollIntoView(node: HTMLElement): { destroy?: () => void } {
	node.scrollIntoView({ behavior: 'smooth', block: 'center' })

	return {}
}
