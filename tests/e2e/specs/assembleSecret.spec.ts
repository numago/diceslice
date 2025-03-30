import { expect, test } from '@playwright/test'
import {
	assembleSliceFiles,
	uploadInvalidSliceFiles,
	goToAssemblePage,
	verifyQrTestFiles,
	TEST_DATA_PATH,
	uploadEncryptedPayloadFile
} from '../utils/testHelpers'
import * as path from 'path'

test.describe('Secret Assembly Process', () => {
	test.beforeEach(async ({ page }) => {
		await goToAssemblePage(page)
	})

	test('assembles and decodes a small secret from binary slice files', async ({ page }) => {
		await assembleSliceFiles(page, ['small-t2-1.slice', 'small-t2-2.slice'])
		await page.getByRole('button', { name: /show your secret/i }).click()
		await expect(page.locator('textarea')).toBeVisible()
		await expect(page.locator('textarea')).toHaveValue('this is a test')
	})

	test('assembles and decodes a secret from QR code files', async ({ page }) => {
		try {
			const qrFilePaths = await verifyQrTestFiles()
			await assembleSliceFiles(page, qrFilePaths)
			await page.getByRole('button', { name: /show your secret/i }).click()
			await expect(page.locator('textarea')).toBeVisible()
			await expect(page.locator('textarea')).toHaveValue('this is a test')
		} catch (error) {
			console.error('Error in QR code test:', error)
			throw error
		}
	})

	test('handles large secrets with warning before decoding', async ({ page }) => {
		await assembleSliceFiles(page, ['100000B-t2-1.slice', '100000B-t2-2.slice'])
		await page.getByRole('button', { name: /show your secret/i }).click()
		await expect(page.getByText(/proceed with caution/i)).toBeVisible()
		await page.getByRole('button', { name: /decode secret/i }).click()
		await expect(page.locator('textarea')).toBeVisible()
	})

	test('allows downloading the assembled secret', async ({ page }) => {
		await assembleSliceFiles(page, ['small-t2-1.slice', 'small-t2-2.slice'])
		const downloadPromise = page.waitForEvent('download')
		await page.getByRole('link', { name: /download/i }).click()
		expect((await downloadPromise).suggestedFilename()).toEqual(expect.stringContaining('.txt'))
	})

	test('displays error for invalid slice files', async ({ page }) => {
		await uploadInvalidSliceFiles(page, ['invalid-1.slice', 'invalid-2.slice'])
		await expect(page.getByText(/could not recover secret/i)).toBeVisible()
	})

	test('shows and hides decoded secret when toggling show/hide button', async ({ page }) => {
		await assembleSliceFiles(page, ['small-t2-1.slice', 'small-t2-2.slice'])

		// Click to show secret
		await page.getByRole('button', { name: /show your secret/i }).click()
		await expect(page.locator('textarea')).toBeVisible()

		// Click to hide secret
		await page.getByRole('button', { name: /hide your secret/i }).click()
		await expect(page.locator('textarea')).not.toBeVisible()

		// Click to show again
		await page.getByRole('button', { name: /show your secret/i }).click()
		await expect(page.locator('textarea')).toBeVisible()
	})

	test('assembles secret with encrypted payload file', async ({ page }) => {
		// First, upload key slice files
		await page.setInputFiles('input#fileUploadInput', [
			path.join(TEST_DATA_PATH, 'detached-key-1.slice'),
			path.join(TEST_DATA_PATH, 'detached-key-2.slice')
		]);

		// Then upload the encrypted payload file
		await uploadEncryptedPayloadFile(page, 'detached-payload.bin');

		// Click the recover button
		await page.getByRole('button', { name: /recover secret/i }).click();

		// Verify successful decryption
		await expect(page.getByText(/decrypted successfully/i)).toBeVisible();
		await page.getByRole('button', { name: /show your secret/i }).click();
		await expect(page.locator('textarea')).toBeVisible();

		// Check that the textarea has some content
		const textContent = await page.locator('textarea').inputValue();
		expect(textContent).toBe("This is a test!");
	})

	test('validates the recover button is disabled when no files are uploaded', async ({ page }) => {
		const recoverButton = page.getByRole('button', { name: /recover secret/i })
		await expect(recoverButton).toBeDisabled()
	})

	test('shows loading indicator while assembling secret', async ({ page }) => {
		await page.setInputFiles('input#fileUploadInput', [
			path.join(TEST_DATA_PATH, 'small-t2-1.slice'),
			path.join(TEST_DATA_PATH, 'small-t2-2.slice')
		])

		await page.getByRole('button', { name: /recover secret/i }).click()
		// This is a race condition, so we need to make sure the test doesn't fail
		// if assembling is too fast. We'll check if either loading or result is visible.
		try {
			await expect(page.getByText(/assembling files/i)).toBeVisible({ timeout: 1000 })
		} catch (e) {
			// If the loading text is not visible, the assembly might have completed too fast
			await expect(page.getByText(/decrypted successfully/i)).toBeVisible()
		}
	})
})
