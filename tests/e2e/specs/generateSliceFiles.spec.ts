import { expect, test } from '@playwright/test'
import {
	goToGeneratePage,
	fillGenerateForm,
	submitGenerateFormAndExpectDownloads
} from '../utils/testHelpers'

test.describe('Slice File Generation Process', () => {
	const SLICE_COUNT = 3
	const THRESHOLD = 2

	test.beforeEach(async ({ page }) => {
		await goToGeneratePage(page)
	})

	async function selectInputType(page, inputType) {
		// Click the label instead of the input directly to avoid interception issues
		await page.locator(`label[for="${inputType}"]`).click({ force: true })
	}

	async function waitForAndVerifyDownloads(page, count = SLICE_COUNT) {
		const downloadPromises = Array.from({ length: count }, () => page.waitForEvent('download'))
		await page.getByRole('button', { name: `Download ${count} slice files` }).click()
		const downloads = await Promise.all(downloadPromises)

		expect(downloads.length).toBe(count)
	}

	test('generates slice files from text input with password field', async ({ page }) => {
		await selectInputType(page, 'text')
		await page.waitForSelector('input#secretTextInput', { state: 'visible' })
		await page.locator('#secretTextInput').fill('this is a test')
		await fillGenerateForm(page, SLICE_COUNT, THRESHOLD)
		await submitGenerateFormAndExpectDownloads(page, SLICE_COUNT)

		await waitForAndVerifyDownloads(page)
	})

	test('generates slice files from visible textarea', async ({ page }) => {
		await selectInputType(page, 'text')
		await page.waitForSelector('input#secretTextInput', { state: 'visible' })
		await page.getByRole('button', { name: /show secret/i }).click()
		await page.waitForSelector('textarea#secretTextArea', { state: 'visible' })
		await page.locator('#secretTextArea').fill('this is a test')
		await fillGenerateForm(page, SLICE_COUNT, THRESHOLD)
		await submitGenerateFormAndExpectDownloads(page, SLICE_COUNT)

		await waitForAndVerifyDownloads(page)
	})

	test('generates slice files from file upload', async ({ page }) => {
		await selectInputType(page, 'file')
		await page.setInputFiles('input#secretFile', {
			name: 'test-secret.bin',
			mimeType: 'application/octet-stream',
			buffer: Buffer.from('hello')
		})
		await page.getByText('test-secret.bin').waitFor({ state: 'visible' })
		await fillGenerateForm(page, SLICE_COUNT, THRESHOLD)
		await submitGenerateFormAndExpectDownloads(page, SLICE_COUNT)

		await waitForAndVerifyDownloads(page)
	})

	test('generates both binary slice files and QR codes', async ({ page }) => {
		await selectInputType(page, 'text')
		await page.waitForSelector('input#secretTextInput', { state: 'visible' })
		await page.locator('#secretTextInput').fill('this is a test')
		await fillGenerateForm(page, SLICE_COUNT, THRESHOLD)

		const checkboxChecked = await page.getByLabel('Generate QR-codes').isChecked()
		if (!checkboxChecked) {
			await page.getByLabel('Generate QR codes').click()
		}

		await submitGenerateFormAndExpectDownloads(page, SLICE_COUNT)
		await expect(
			page.getByRole('button', { name: `Download ${SLICE_COUNT} QR-codes` })
		).toBeVisible()
		const qrDownloadPromise = page.waitForEvent('download')
		await page.getByRole('button', { name: `Download ${SLICE_COUNT} QR-codes` }).click()
		const qrDownload = await qrDownloadPromise

		expect(qrDownload.suggestedFilename()).toContain('.png')
	})
})
