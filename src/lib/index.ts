import { SecretAssemblyError, SliceFileGenerationError, InsufficientSlicesError, InconsistentThresholdError, InvalidThresholdError, InvalidShareCountError } from '$lib/errors'
import * as SecretSharing from '$lib/secretSharing'
import type { SliceFileHeader, SliceFilePayload } from '$lib/sliceFile'
import * as SliceFileHandler from '$lib/sliceFile'
import { exportRawKey, generateAESKey, importAESKey } from '$lib/webCrypto'

// Placeholder for future version use. Currently not used in the application's logic.
export const VERSION_NUMBER = 0

async function generateSliceFilesCommon(
    threshold: number,
    count: number,
    payload: SliceFilePayload,
): Promise<{ encryptedPayloadBuffer: ArrayBuffer, headers: SliceFileHeader[] }> {
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

    const encryptedPayloadBuffer = await SliceFileHandler.createEncryptedPayloadBuffer(payload, encryptionKey);

    const headers = keySlices.map(keySlice => ({ version, threshold, keySlice }));

    return { encryptedPayloadBuffer, headers };
}

export async function generateSliceFileBuffers(
    threshold: number,
    count: number,
    payload: SliceFilePayload,
): Promise<ArrayBuffer[]> {
    try {
        const { encryptedPayloadBuffer, headers } = await generateSliceFilesCommon(threshold, count, payload);

        const attachedSliceFiles = await Promise.all(
            headers.map(header => SliceFileHandler.createAttachedSliceFile(header, encryptedPayloadBuffer))
        );

        return attachedSliceFiles;
    } catch (error) {
        if (error instanceof InvalidThresholdError || error instanceof InvalidShareCountError) {
            throw error;
        }
        throw new SliceFileGenerationError('Unexpected error occurred during slice file generation');
    }
}

export async function generateDetachedSliceFileBuffers(
    threshold: number,
    count: number,
    payload: SliceFilePayload
): Promise<{ payloadBuffer: ArrayBuffer, headerBuffers: ArrayBuffer[] }> {
    try {
        const { encryptedPayloadBuffer, headers } = await generateSliceFilesCommon(threshold, count, payload);

        const headerBuffers = await Promise.all(
            headers.map(header => SliceFileHandler.createDetachedSliceFile(header))
        );

        return {
            payloadBuffer: encryptedPayloadBuffer,
            headerBuffers
        };
    } catch (error) {
        if (error instanceof InvalidThresholdError || error instanceof InvalidShareCountError) {
            throw error;
        }
        throw new SliceFileGenerationError('Unexpected error occurred during slice file generation');
    }
}

export async function assembleSecretPayload(
    sliceFileBuffers: ArrayBuffer[],
    encryptedPayloadBuffer?: Uint8Array
): Promise<SliceFilePayload> {
    try {
        validateMinimumSliceFiles(sliceFileBuffers)

        const sliceFileHeaders = sliceFileBuffers.map(SliceFileHandler.getHeader)
        const threshold = getThreshold(sliceFileHeaders)

        validateThresholdRequirement(threshold, sliceFileBuffers)

        const decryptionKey = await assembleCryptoKey(sliceFileHeaders, threshold)

        const payload = encryptedPayloadBuffer ?? await SliceFileHandler.getEncryptedPayload(sliceFileBuffers[0])
        const decryptedPayload = await SliceFileHandler.decryptPayload(payload, decryptionKey)
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