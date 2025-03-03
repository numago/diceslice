import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config = {
	darkMode: ['variant', ['&:where(.dark, .dark *)', '&:where(:global(html.dark-mode))']],
	content: ['./src/**/*.{html,js,svelte,ts}'],
} satisfies Config

export default config 