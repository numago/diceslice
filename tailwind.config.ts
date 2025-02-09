import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				marker: ['"Permanent Marker"', ...defaultTheme.fontFamily.sans]
			},
			colors: {
				assemble: {
					light: '#fff0e8',
					DEFAULT: '#ff9e64',
					dark: '#471b00'
				},
				generate: {
					light: '#f0ebf9',
					DEFAULT: '#9d7cd8',
					dark: '#1d1034'
				}
			}
		}
	},
	plugins: [require('@tailwindcss/forms')]
}

export default config 