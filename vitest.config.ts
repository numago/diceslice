import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
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
    },
    resolve: {
        alias: {
            '$lib': resolve(__dirname, './src/lib')
        }
    }
}) 