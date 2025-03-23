import { expect, test } from '@playwright/test'
import {
	assembleSliceFiles,
	uploadInvalidSliceFiles,
	goToAssemblePage,
	verifyQrTestFiles,
	TEST_DATA_PATH
} from '../utils/testHelpers'

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
})
