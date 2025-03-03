import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		tailwindcss(),
		svelte()
	],
	resolve: {
		alias: {
			'$lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	},
	publicDir: 'public',
	base: ''
})
