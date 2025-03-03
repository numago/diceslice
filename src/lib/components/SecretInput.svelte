<script lang="ts">
	import { bytesToSizeString } from '$lib/utils'
	import { fly } from 'svelte/transition'

	export let secret: string | File | null

	const InputMethod = {
		TextArea: 'TextArea',
		TextInput: 'TextInput',
		File: 'File'
	} as const;
	
	type InputMethodType = typeof InputMethod[keyof typeof InputMethod];

	let secretInputMethod: InputMethodType = InputMethod.TextInput
	let uploadFileList: FileList | undefined
	let fileInput: File | null
	let textInput: string = ''

	$: fileInput = uploadFileList?.[0] ?? null
	$: secret = secretInputMethod === InputMethod.File ? fileInput : textInput

	function updateInputMethod(value: InputMethodType) {
		secretInputMethod = value
	}

	function clearFile() {
		fileInput = null
		uploadFileList = undefined
	}

	function clearText() {
		textInput = ''
	}

	export function clearAllInputs() {
		clearFile()
		clearText()
	}
</script>

<fieldset class="overflow-wrap min-w-0">
	<legend class="form-label">Choose your input method</legend>
	<!-- Select input method section -->
	<div class="flex space-x-3">
		<div class="grow md:flex-none select-none">
			<input
				type="radio"
				id="text"
				name="inputType"
				class="sr-only radio-button"
				value="text"
				checked={secretInputMethod !== InputMethod.File}
				on:change={() => updateInputMethod(InputMethod.TextInput)}
			/>
			<label
				for="text"
				class="flex"
				aria-current={secretInputMethod === InputMethod.TextArea ? 'true' : undefined}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-6 h-6"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
					/>
				</svg>
				Text input
			</label>
		</div>
		<span class="leading-10 px-1 hidden md:block text-gray-500 dark:text-slate-400">or</span>
		<div class="grow md:flex-none select-none">
			<input
				type="radio"
				id="file"
				name="inputType"
				class="sr-only radio-button"
				value="file"
				checked={secretInputMethod === InputMethod.File}
				on:change={() => updateInputMethod(InputMethod.File)}
			/>
			<label
				for="file"
				class="flex"
				aria-current={secretInputMethod === InputMethod.File ? 'true' : undefined}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-6 h-6"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
					/>
				</svg>
				File upload
			</label>
		</div>
	</div>

	<div>
		<!-- File input section -->
		{#if secretInputMethod === InputMethod.File}
			<div in:fly>
				{#if fileInput}
					<div
						class="rounded-md overflow-scroll bg-gray-100 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-900 mt-5"
					>
						<div class="flex justify-between p-2">
							<span class="text-gray-700 dark:text-slate-300 text-sm font-medium p-1"
								>Your uploaded file:</span
							>
							<button
								type="button"
								class="inline-flex items-center gap-x-1.5 rounded dark:border-slate-600 bg-white dark:bg-slate-800 pl-2 pr-1 py-1 text-sm font-semibold text-gray-600 dark:text-slate-200"
								on:click={clearFile}
							>
								<!-- trash icon -->
								Clear file
								<div class="p-0.5 rounded-md dark:text-red-600">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										class="size-5"
									>
										<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
									</svg>
								</div>
							</button>
						</div>
						<div class="flex py-3 px-4 items-center">
							<div class="flex-shrink-0">
								<!-- paperclip icon -->
								<svg
									class="h-6 w-6 text-gray-600 dark:text-slate-300"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									aria-hidden="true"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
									/>
								</svg>
							</div>
							<div class="ml-3">
								<span class="block text-gray-600 dark:text-white text-lg font-medium italic">
									{fileInput.name}
								</span>
								<span class="block text-gray-400 dark:text-slate-400">
									({bytesToSizeString(fileInput.size)})
								</span>
							</div>
						</div>
					</div>
				{:else}
					<label for="secretFile" class="form-label">Upload your secret file</label>
					<input
						required={!fileInput}
						bind:files={uploadFileList}
						id="secretFile"
						type="file"
						class="file-input form-input-additional focus-within:ring-generate"
					/>
				{/if}

				<p class="mt-3 text-sm leading-6 text-gray-600 dark:text-slate-400">
					<span class="font-medium text-gray-800 dark:text-slate-300">Caution:</span> Encrypting/decrypting
					large files may be slow or fail. The maximum file size is &approx; 2GB.
				</p>
			</div>

			<!-- Text input section -->
		{:else if secretInputMethod === InputMethod.TextInput}
			<div class="flex justify-between">
				<label for="secretTextInput" class="form-label">Enter your secret</label>
				<div class="mt-4 mb-3">
					<button
						id="showSecretText"
						class="text-gray-800 dark:text-slate-300 border border-gray:300 dark:border-slate-500 rounded-md text-sm py-0.5 px-2"
						on:click={() => (secretInputMethod = InputMethod.TextArea)}
					>
						<span class="inline">Show secret</span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-5 inline"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
							/>
						</svg>
					</button>
				</div>
			</div>
			<div class="relative">
				<div in:fly>
					<input
						required
						bind:value={textInput}
						type="password"
						id="secretTextInput"
						placeholder="Enter your secret here"
						class="form-input-additional focus-within:ring-generate"
					/>
				</div>
			</div>

			<!-- Text area section -->
		{:else if secretInputMethod === InputMethod.TextArea}
			<div class="flex justify-between">
				<label for="secretTextArea" class="form-label">Enter your secret</label>
				<div class="mt-4 mb-3">
					<button
						id="hideSecretText"
						class="text-gray-800 dark:text-slate-300 border border-gray:300 dark:border-slate-500 rounded-md text-sm py-0.5 px-2"
						on:click={() => (secretInputMethod = InputMethod.TextInput)}
					>
						<span class="inline">Hide secret</span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-5 inline"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
							/>
						</svg>
					</button>
				</div>
			</div>
			<div in:fly>
				<textarea
					rows="5"
					required
					bind:value={textInput}
					id="secretTextArea"
					placeholder="Enter your secret here"
					class="form-input-additional focus-within:ring-generate"
				></textarea>
			</div>
		{/if}
	</div>
</fieldset>

<style lang="postcss">
	.radio-button + label {
		@apply inline-flex items-center justify-center gap-x-1 cursor-pointer rounded-md px-3 py-2 text-sm font-medium ring-2 w-full;
		@apply text-gray-500 hover:text-gray-700 ring-gray-300;
		@apply dark:text-slate-400 dark:hover:text-slate-300 dark:ring-slate-700;
	}

	.radio-button:checked + label {
		@apply ring-2 ring-generate text-gray-600 dark:text-slate-300;
	}

	.file-input {
		@apply p-0 rounded-md w-full file:py-2.5 file:mr-4 file:border-0 file:px-4 file:ring-2 file:rounded-l-md border-0 outline-0;
		@apply file:bg-gray-200 file:text-gray-700;
		@apply dark:file:bg-slate-500 dark:file:text-slate-100;
	}
</style>
