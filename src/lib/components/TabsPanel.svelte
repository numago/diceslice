<script lang="ts">
	import SecretAssemblyForm from '$lib/components/SecretAssemblyForm.svelte'
	import SliceFileGeneratorForm from '$lib/components/SliceFileGeneratorForm.svelte'

	const tabs = [
		{
			label: 'Generate slice files',
			title: 'Generate encrypted slice files',
			description:
				'Input your secret data to obtain downloadable, encrypted slice files codes that are ready for you to distribute securely.',
			component: SliceFileGeneratorForm,
			cssClass: 'generate'
		},
		{
			label: 'Assemble secret',
			title: 'Assemble your secret',
			description:
				'Upload the required number of slice files to assemble and gain access to your encrypted secret.',
			component: SecretAssemblyForm,
			cssClass: 'assemble'
		}
	]
	let activeTabIndex = $state(0)
	const activeTab = $derived(tabs[activeTabIndex])
</script>

<div
	class="mx-auto max-w-2xl bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700 overflow-hidden rounded-xl border-2 border-gray-200 dark:border-slate-800 shadow-2xl shadow-gray-200 dark:shadow-slate-950"
>
	<div class="flex divide-x divide-gray-300 dark:divide-slate-700">
		<button
			class="w-full py-5 px-4 font-bold md:text-lg tracking-wide {activeTabIndex === 0 
				? 'bg-generate-light dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-b-4 border-b-generate' 
				: 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:border-b-gray-300 hover:text-gray-500 dark:hover:border-b-slate-600 dark:hover:text-slate-300 border-b-4 border-transparent'}"
			onclick={() => (activeTabIndex = 0)}
		>
			Generate slice files
		</button>
		<button
			class="w-full py-5 px-4 font-bold md:text-lg tracking-wide {activeTabIndex === 1 
				? 'bg-assemble-light dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-b-4 border-b-assemble' 
				: 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:border-b-gray-300 hover:text-gray-500 dark:hover:border-b-slate-600 dark:hover:text-slate-300 border-b-4 border-transparent'}"
			onclick={() => (activeTabIndex = 1)}
		>
			Assemble secret
		</button>
	</div>

	<div class="tab-content px-4 py-5 sm:p-6">
		<div>
			<h5 class="text-xl tracking-wide leading-10 font-semibold text-gray-900 dark:text-slate-100">
				{activeTab.title}
			</h5>
			<p class="mt-2 text-base text-gray-500 dark:text-slate-400">
				{activeTab.description}
			</p>
			<hr class="mt-4 dark:border-slate-700 mb-2" />
			<div>
				<activeTab.component />
			</div>
		</div>
	</div>
</div>
