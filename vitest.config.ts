/// <reference types="@vitest/browser/providers/playwright" />

import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
    test: {
        browser: {
            headless: true,
            provider: 'playwright',
            enabled: true,
            instances: [
                {
                    browser: 'chromium',
                }
            ]
        },
        include: ['tests/unit/lib/**/*.{test,spec}.{js,ts}'],
        coverage: {
            provider: 'istanbul'
        },
    },
    resolve: {
        alias: {
            '$lib': resolve(__dirname, './src/lib')
        }
    }
}) 