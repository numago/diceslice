import * as Comlink from 'comlink'
import { encryptData, decryptData } from '$lib/webCrypto'
import { serializeString, deserializeString, serializeFile } from '$lib/sliceFile/bufferUtils'

export type WorkerApi = {
	encryptData: typeof encryptData
	decryptData: typeof decryptData
	serializeString: typeof serializeString
	deserializeString: typeof deserializeString
	serializeFile: typeof serializeFile
}

Comlink.expose({
	encryptData,
	decryptData,
	serializeString,
	deserializeString,
	serializeFile
} as WorkerApi)
