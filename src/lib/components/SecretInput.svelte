<script lang="ts">
	import { fly } from 'svelte/transition'
	import FileInput from '$lib/components/FileInput.svelte'

	interface SecretInputProps {
		secret?: string | File | null;
	}

	let { secret = $bindable() }: SecretInputProps = $props();

	const InputMethod = {
		TextArea: 'TextArea',
		TextInput: 'TextInput',
		File: 'File'
	} as const;
	
	type InputMethodType = typeof InputMethod[keyof typeof InputMethod];

	let tabs = $state([
		{ 
			name: 'Text input', 
			current: true,
			icon: `<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="w-5 h-5 mr-2"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
				/>
			</svg>`
		},
		{ 
			name: 'File upload', 
			current: false,
			icon: `<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="w-5 h-5 mr-2"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
				/>
			</svg>`
		}
	]);

	let secretInputMethod = $state<InputMethodType>(InputMethod.TextInput);
	let fileInput = $state<File | null>(null);
	let textInput = $state<string>('');
	let fileInputComponent = $state<FileInput | null>(null);

	function selectTab(index: number) {
		tabs = tabs.map((tab, i) => ({
			...tab,
			current: i === index
		}))
		
		secretInputMethod = index === 0 ? InputMethod.TextInput : InputMethod.File;
	}

	function toggleTextVisibility(e: Event) {
		e.preventDefault()
		secretInputMethod = secretInputMethod === InputMethod.TextInput 
			? InputMethod.TextArea 
			: InputMethod.TextInput;
	}

	$effect(() => {
		secret = secretInputMethod === InputMethod.File ? fileInput : textInput;
	});

	export function clearAllInputs() {
		if (fileInputComponent) {
			fileInputComponent.clearFile();
		}
		fileInput = null;
		textInput = '';
	}
</script>

<fieldset class="overflow-wrap min-w-0">
	<div class="block mb-4">
		<p class="form-label">Choose your input method</p>
		<nav class="flex space-x-4" aria-label="Tabs">
			{#each tabs as tab, i}
				<button
					type="button"
					class="{tab.current
						? 'text-slate-100 ring-generate'
						: 'text-slate-400 hover:text-slate-300 ring-slate-500'} 
					rounded-md px-3 py-3 text-sm font-medium ring-2 w-full flex items-center justify-center"
					aria-current={tab.current ? 'page' : undefined}
					onclick={() => selectTab(i)}
				>
					{@html tab.icon}
					{tab.name}
				</button>
			{/each}
		</nav>
	</div>

	<div>
		{#if secretInputMethod === InputMethod.File }
			<div in:fly>
				<FileInput 
					bind:fileInput
					label="Upload your secret file"
					required={!fileInput}
					bind:this={fileInputComponent}
				/>
				<p class="mt-3 text-sm leading-6 text-gray-600 dark:text-slate-400">
					<span class="font-medium text-gray-800 dark:text-slate-300">Caution:</span> Encrypting/decrypting large files may be slow or fail. The maximum file size is &approx; 2GB.
				</p>
			</div>

		{:else}
			<div class="flex justify-between">
				<label for={secretInputMethod === InputMethod.TextInput ? 'secretTextInput' : 'secretTextArea'} class="form-label">
					Enter your secret
				</label>
				<div class="mt-4 mb-3">
					<button
						id={secretInputMethod === InputMethod.TextInput ? 'showSecretText' : 'hideSecretText'}
						class="text-gray-800 dark:text-slate-300 border border-gray:300 dark:border-slate-500 rounded-md text-sm py-0.5 px-2"
						onclick={toggleTextVisibility}
					>
						<span class="inline">{secretInputMethod === InputMethod.TextInput ? 'Show' : 'Hide'} secret</span>
						{#if secretInputMethod === InputMethod.TextInput}
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
						{:else}
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
						{/if}
					</button>
				</div>
			</div>
			<div class="relative">
				<div in:fly>
					{#if secretInputMethod === InputMethod.TextInput}
						<input
							required
							bind:value={textInput}
							type="password"
							id="secretTextInput"
							placeholder="Enter your secret here"
							class="form-input-additional focus-within:ring-generate"
						/>
					{:else}
						<textarea
							rows="5"
							required
							bind:value={textInput}
							id="secretTextArea"
							placeholder="Enter your secret here"
							class="form-input-additional focus-within:ring-generate"
						></textarea>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</fieldset>