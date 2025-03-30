import { expect, test } from '@playwright/test'
import {
	goToGeneratePage,
	fillGenerateForm,
	submitGenerateFormAndExpectDownloads,
	setDetachedFilesOption
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
		await page.getByRole('button', { name: new RegExp(`Download ${count} slice files`, 'i') }).click()
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

		// Make sure QR-codes option is checked
		const checkboxChecked = await page.getByLabel('Generate QR-codes').isChecked()
		if (!checkboxChecked) {
			await page.getByLabel('Generate QR-codes').click()
		}

		await submitGenerateFormAndExpectDownloads(page, SLICE_COUNT)
		await expect(
			page.getByRole('button', { name: new RegExp(`Download ${SLICE_COUNT} slice QR-codes`, 'i') })
		).toBeVisible()
		const qrDownloadPromises = Array.from({ length: SLICE_COUNT }, () => page.waitForEvent('download'))
		await page.getByRole('button', { name: new RegExp(`Download ${SLICE_COUNT} slice QR-codes`, 'i') }).click()
		const qrDownloads = await Promise.all(qrDownloadPromises)

		expect(qrDownloads.length).toBe(SLICE_COUNT)
		expect(qrDownloads[0].suggestedFilename()).toContain('.png')
	})

	test('generates detached files with secret payload and key files', async ({ page }) => {
		await selectInputType(page, 'text')
		await page.waitForSelector('input#secretTextInput', { state: 'visible' })
		await page.locator('#secretTextInput').fill('this is a test')
		await fillGenerateForm(page, SLICE_COUNT, THRESHOLD)
		
		// Enable the detached files option
		await setDetachedFilesOption(page, true)
		
		await page.locator('button[type="submit"]').click({ force: true })
		await page.waitForSelector('div:has-text("Your downloads are ready!")', { state: 'visible' })
		
		// Check for the encrypted secret file button
		await expect(
			page.getByRole('button', { name: /Download encrypted secret/i })
		).toBeVisible()
		
		// Check for the key files button
		await expect(
			page.getByRole('button', { name: new RegExp(`Download ${SLICE_COUNT} key files`, 'i') })
		).toBeVisible()
		
		// Verify downloads work
		const secretDownloadPromise = page.waitForEvent('download')
		await page.getByRole('button', { name: /Download encrypted secret/i }).click()
		const secretDownload = await secretDownloadPromise
		expect(secretDownload).toBeTruthy()
		
		// Download and verify key files
		const keyDownloadPromises = Array.from({ length: SLICE_COUNT }, () => page.waitForEvent('download'))
		await page.getByRole('button', { name: new RegExp(`Download ${SLICE_COUNT} key files`, 'i') }).click()
		const keyDownloads = await Promise.all(keyDownloadPromises)
		expect(keyDownloads.length).toBe(SLICE_COUNT)
	})

	test('generates detached files with QR codes', async ({ page }) => {
		await selectInputType(page, 'text')
		await page.waitForSelector('input#secretTextInput', { state: 'visible' })
		await page.locator('#secretTextInput').fill('this is a test')
		await fillGenerateForm(page, SLICE_COUNT, THRESHOLD)
		
		// Enable the QR codes option
		const qrCheckboxChecked = await page.getByLabel('Generate QR-codes').isChecked()
		if (!qrCheckboxChecked) {
			await page.getByLabel('Generate QR-codes').click()
		}
		
		// Enable the detached files option
		await setDetachedFilesOption(page, true)
		
		await page.locator('button[type="submit"]').click({ force: true })
		await page.waitForSelector('div:has-text("Your downloads are ready!")', { state: 'visible' })
		
		// Check for the encrypted secret file button
		await expect(
			page.getByRole('button', { name: /Download encrypted secret/i })
		).toBeVisible()
		
		// Check for the key files button
		await expect(
			page.getByRole('button', { name: new RegExp(`Download ${SLICE_COUNT} key files`, 'i') })
		).toBeVisible()
		
		// Check for the key QR codes button
		await expect(
			page.getByRole('button', { name: new RegExp(`Download ${SLICE_COUNT} key QR-codes`, 'i') })
		).toBeVisible()
		
		// Verify QR code downloads work
		const qrDownloadPromises = Array.from({ length: SLICE_COUNT }, () => page.waitForEvent('download'))
		await page.getByRole('button', { name: new RegExp(`Download ${SLICE_COUNT} key QR-codes`, 'i') }).click()
		const qrDownloads = await Promise.all(qrDownloadPromises)
		expect(qrDownloads.length).toBe(SLICE_COUNT)
		expect(qrDownloads[0].suggestedFilename()).toContain('.png')
	})
})
