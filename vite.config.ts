import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		browser: {
			enabled: true,
			headless: true,
			name: 'chromium',
			provider: 'playwright'
		},
		include: ['tests/unit/lib/**/*.{test,spec}.{js,ts}'],
		coverage: {
			provider: 'istanbul'
		}
	}
})
