import { expect, type Page } from '@playwright/test'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import * as fs from 'fs/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const TEST_DATA_PATH = join(__dirname, '..', 'test-data')

async function verifyTestFilesExist(filePaths: string[]): Promise<void> {
	try {
		await Promise.all(filePaths.map((path) => fs.access(path)))
	} catch (error) {
		console.error('Test files not found:', error)
		throw new Error(
			'Required test files not found. All test files should be committed to the repository as primary test data.'
		)
	}
}

export async function goToHomePage(page: Page): Promise<void> {
	await page.goto('/')
}

export async function goToGeneratePage(page: Page): Promise<void> {
	await goToHomePage(page)
	await page.getByRole('button', { name: /generate slice files/i }).click()
}

export async function goToAssemblePage(page: Page): Promise<void> {
	await goToHomePage(page)
	await page.getByRole('button', { name: /assemble secret/i }).click()
}

export async function assembleSliceFiles(page: Page, filePaths: string[]): Promise<void> {
	const fullPaths = filePaths.map((path) => join(TEST_DATA_PATH, path))
	await verifyTestFilesExist(fullPaths)
	await page.setInputFiles('input#fileUploadInput', fullPaths)
	await page.getByRole('button', { name: /recover secret/i }).click()

	await expect(page.getByText(/decrypted successfully/i)).toBeVisible()
}

export async function uploadInvalidSliceFiles(page: Page, filePaths: string[]): Promise<void> {
	const fullPaths = filePaths.map((path) => join(TEST_DATA_PATH, path))
	await verifyTestFilesExist(fullPaths)
	await page.setInputFiles('input#fileUploadInput', fullPaths)
	await page.getByRole('button', { name: /recover secret/i }).click()
}

export async function uploadEncryptedPayloadFile(page: Page, filePath: string): Promise<void> {
	const fullPath = join(TEST_DATA_PATH, filePath)
	await verifyTestFilesExist([fullPath])
	await page.setInputFiles('#fileInput', fullPath)
}

export async function verifyQrTestFiles(): Promise<string[]> {
	const qrFile1 = 'small-t2-1.slice.qr.png'
	const qrFile2 = 'small-t2-2.slice.qr.png'
	const qrFile1Path = join(TEST_DATA_PATH, qrFile1)
	const qrFile2Path = join(TEST_DATA_PATH, qrFile2)

	await verifyTestFilesExist([qrFile1Path, qrFile2Path])

	return [qrFile1, qrFile2]
}

export async function fillGenerateForm(
	page: Page,
	sliceCount: number,
	threshold: number
): Promise<void> {
	await page.locator('input#shareCount').fill('')
	await page.locator('input#shareCount').fill(sliceCount.toString())
	await page.locator('input#shareThreshold').fill('')
	await page.locator('input#shareThreshold').fill(threshold.toString())

	await expect(page.locator('input#shareCount')).toHaveValue(sliceCount.toString())
	await expect(page.locator('input#shareThreshold')).toHaveValue(threshold.toString())
}

export async function setDetachedFilesOption(page: Page, enabled: boolean): Promise<void> {
	const isChecked = await page.getByLabel('Detached mode').isChecked();
	if ((enabled && !isChecked) || (!enabled && isChecked)) {
		await page.getByLabel('Detached mode').click();
	}
}

export async function submitGenerateFormAndExpectDownloads(
	page: Page,
	sliceCount: number
): Promise<void> {
	await page.locator('button[type="submit"]').click({ force: true })
	await page.waitForSelector('div:has-text("Your downloads are ready!")', { state: 'visible' })

	await expect(
		page.getByRole('button', { name: new RegExp(`Download ${sliceCount} slice files`, 'i') })
	).toBeVisible()
	await expect(page.getByRole('button', { name: /Download all as ZIP/i })).toBeVisible()
}
