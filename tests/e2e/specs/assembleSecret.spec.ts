import { expect, test, type Page } from '@playwright/test'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

test.describe('file assembly process', () => {
	const __dirname = dirname(fileURLToPath(import.meta.url))
	const testDataPath = join(__dirname, '..', 'test-data')

	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		// Open tab to open slice file assembly form
		await page.locator('nav >> button', { hasText: /assemble/i }).click()
	})

	async function assembleSliceFiles(page: Page, filePaths: string[]) {
		// Upload slice files
		await page.setInputFiles(
			'input#fileUploadInput',
			filePaths.map((path) => join(testDataPath, path))
		)
		// Click the submit button to start assembling files
		await page.locator('form >> button[type=submit]', { hasText: /recover/i }).click()

		// Check for success message
		await expect(page.locator('.tab-content')).toHaveText(/success/i)
	}

	test('decode secret', async ({ page }) => {
		await assembleSliceFiles(page, ['small-t2-1.slice', 'small-t2-2.slice'])
		// Click button to start decoding the secret
		await page.locator('output >> button', { hasText: /show/i }).click()

		await expect(page.locator('textarea')).toBeVisible()
		await expect(page.locator('textarea')).toHaveValue('this is a test')
	})

	test('decode large secret', async ({ page }) => {
		await assembleSliceFiles(page, ['100000B-t2-1.slice', '100000B-t2-2.slice'])
		// Click button to start decoding the secret
		await page.locator('output >> button', { hasText: /show/i }).click()
		// Check for warning for decoding large files
		await expect(page.locator('.tab-content')).toHaveText(/caution/i)
		// Proceed with encoding (dismiss warning)
		await page.locator('output >> button', { hasText: /decode secret/i }).click()

		await expect(page.locator('.tab-content >> textarea')).toBeVisible()
	})

	test('download secret', async ({ page }) => {
		await assembleSliceFiles(page, ['small-t2-1.slice', 'small-t2-2.slice'])
		const downloadPromise = page.waitForEvent('download')
		await page.locator('output >> a', { hasText: /download/i }).click()

		expect((await downloadPromise).suggestedFilename()).toEqual(expect.stringContaining('.txt'))
	})

	// test('handle invalid slice files', async ({ page }) => {
	// 	await assembleSliceFiles(page, ['invalid-1.slice', 'invalid-2.slice'])
	// 	await expect(page.locator('.tab-content')).toHaveText(/error/i)
	// })
})
