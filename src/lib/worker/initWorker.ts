import * as Comlink from 'comlink'
import type { WorkerApi } from './worker'

export const initWorker = () => {
	const worker = new Worker(new URL('./worker', import.meta.url), { type: 'module' })
	const workerApi = Comlink.wrap<WorkerApi>(worker)

	const terminateWorker = () => {
		worker.terminate()
	}

	return { workerApi, terminateWorker }
}
