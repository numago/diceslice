import { SecretAssemblyError, SliceFileGenerationError, InsufficientSlicesError, InconsistentThresholdError, InvalidThresholdError, InvalidShareCountError } from '$lib/errors'
import * as SecretSharing from '$lib/secretSharing'
import type { SliceFileHeader, SliceFilePayload } from '$lib/sliceFile'
import * as SliceFile from '$lib/sliceFile'
import { exportRawKey, generateAESKey, importAESKey } from '$lib/webCrypto'

// Placeholder for future version use. Currently not used in the application's logic.
export const VERSION_NUMBER = 0

/**
 * Generates slice file buffers from the given payload.
 */
export async function generateSliceFileBuffers(
    threshold: number,
    count: number,
    payload: SliceFilePayload
): Promise<ArrayBuffer[]> {
    try {
        if (threshold < 2) {
            throw new InvalidThresholdError('Threshold must be at least 2');
        }
        if (count < threshold) {
            throw new InvalidShareCountError('Share count must be at least equal to the threshold');
        }

        const version = VERSION_NUMBER
        const encryptionKey = await generateAESKey()
        const keyBytesView = await exportRawKey(encryptionKey)
        const keySlices = await SecretSharing.generateSlices(keyBytesView, threshold, count)

        const sliceFileBuffers = [];
        for (const keySlice of keySlices) {
            const header: SliceFileHeader = { version, threshold, keySlice };
            const buffer = await SliceFile.createBuffer(header, payload, encryptionKey);
            sliceFileBuffers.push(buffer);
        }

        return sliceFileBuffers
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new SliceFileGenerationError('Unexpected error occurred during slice file generation');
    }
}

/**
 * Assembles the secret payload from given slice file buffers.
 */
export async function assembleSecretPayload(
    sliceFileBuffers: ArrayBuffer[]
): Promise<SliceFilePayload> {
    try {
        validateMinimumSliceFiles(sliceFileBuffers)

        const sliceFileHeaders = sliceFileBuffers.map(SliceFile.getHeader)
        const threshold = getThreshold(sliceFileHeaders)

        validateThresholdRequirement(threshold, sliceFileBuffers)

        const decryptionKey = await assembleCryptoKey(sliceFileHeaders, threshold)
        const decryptedPayload = await SliceFile.getDecryptedPayload(sliceFileBuffers[0], decryptionKey)

        return decryptedPayload
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new SecretAssemblyError('Unexpected error occurred during secret assembly');
    }
}

function validateMinimumSliceFiles(sliceFileBuffers: ArrayBuffer[]): void {
    if (sliceFileBuffers.length < 2) {
        throw new InsufficientSlicesError('At least 2 slice files are required to assemble the secret.');
    }
}

function validateThresholdRequirement(threshold: number, sliceFileBuffers: ArrayBuffer[]) {
    if (sliceFileBuffers.length < threshold) {
        throw new SecretAssemblyError(
            `Insufficient number of slice files: Provided ${sliceFileBuffers.length} of the ${threshold} required.`
        )
    }
}

async function assembleCryptoKey(
    headers: SliceFileHeader[],
    threshold: number
): Promise<CryptoKey> {
    const keySlices = headers.map((header) => header.keySlice)
    const cryptoKeyBytesView = await SecretSharing.assembleSecretFromSlices(keySlices, threshold)
    const cryptoKey = await importAESKey(cryptoKeyBytesView)
    return cryptoKey
}

function getThreshold(headers: SliceFileHeader[]): number {
    if (headers.length === 0) {
        throw new SecretAssemblyError('No slice headers provided.');
    }

    const firstThreshold = headers[0].threshold

    if (headers.some((header) => header.threshold !== firstThreshold)) {
        throw new InconsistentThresholdError('Inconsistent threshold values found.');
    }

    return firstThreshold
}