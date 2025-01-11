import { expect, test, type Page } from '@playwright/test'

test.describe('Assemble files and download', () => {
	const SHARE_COUNT = 3
	const THRESHOLD = 2

	async function fillForm(page: Page) {
		await page.fill('input#shareCount', SHARE_COUNT.toString())
		await page.fill('input#shareThreshold', THRESHOLD.toString())

		await expect(page.locator('input#shareCount')).toHaveValue(SHARE_COUNT.toString())
		await expect(page.locator('input#shareThreshold')).toHaveValue(THRESHOLD.toString())
	}

	async function submitFormAndHandleDownloads(page: Page) {
		await page.click('button[type="submit"]')
		await expect(page.locator('button', { hasText: /download.*slice.*files/i })).toBeVisible()
		await expect(page.locator('button', { hasText: /download.*zip/i })).toBeVisible()

		const downloadPromises = Array.from({ length: SHARE_COUNT }, () =>
			page.waitForEvent('download')
		)
		await page.click('button:has-text("Download")')
		const downloads = await Promise.all(downloadPromises)

		expect(downloads.length).toBe(SHARE_COUNT)
	}

	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('generates the slice files from text input with hidden text', async ({ page }) => {
		// Select text as input method (the input element is sr-only)
		await page.click('label[for="text"]')

		await page.fill('input#secretTextInput', 'this is a test')
		await fillForm(page)
		await submitFormAndHandleDownloads(page)
	})

	test('generates the slice files from textarea', async ({ page }) => {
		// Select text as input method (the input element is sr-only)
		await page.click('label[for="text"]')
		await page.click('button#showSecretText')

		await page.fill('textarea#secretTextArea', 'this is a test')
		await fillForm(page)
		await submitFormAndHandleDownloads(page)
	})

	test('generates slice files from file upload', async ({ page }) => {
		// Select file upload as input method (the input element is sr-only)
		await page.click('label[for="file"]')

		await page.setInputFiles('input#secretFile', {
			name: 'file.txt',
			mimeType: 'text/plain',
			buffer: Buffer.from('this is a test')
		})
		await fillForm(page)

		await submitFormAndHandleDownloads(page)
	})
})
