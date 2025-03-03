<script lang="ts">
	import SecretAssemblyForm from '$lib/components/SecretAssemblyForm.svelte'
	import SliceFileGeneratorForm from '$lib/components/SliceFileGeneratorForm.svelte'

	const tabs = [
		{
			label: 'Generate slice files',
			title: 'Generate encrypted slice files',
			description:
				'Input your secret data to obtain downloadable, encrypted slice files that are ready for you to distribute securely.',
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
	<nav class="grid grid-cols-2 divide-x divide-gray-300 dark:divide-slate-700" aria-label="tabs">
		{#each tabs as tab, index (index)}
			<div class="flex">
				<button
					class:active={activeTabIndex === index}
					class="tab-label {tabs[index].cssClass}"
					onclick={() => (activeTabIndex = index)}
				>
					<span class="sm:inline md:text-lg font-bold">{tab.label}</span>
				</button>
			</div>
		{/each}
	</nav>

	<div class="tab-content px-4 py-5 sm:p-6">
		<div>
			<h5 class="text-xl tracking-wide leading-10 font-semibold text-gray-900 dark:text-slate-100">
				{activeTab.title}
			</h5>
			<p class="mt-2 text-base text-gray-500 dark:text-slate-400">
				{activeTab.description}
			</p>
			<hr class="mt-4 dark:border-slate-700" />
			<div>
				<activeTab.component />
			</div>
		</div>
	</div>
</div>
<style>
	@reference "../../app.css";

	.tab-label {
		@apply w-full whitespace-nowrap border-b-4 border-gray-200 tracking-wide inline-flex justify-center items-center gap-x-2 py-5 px-1;
		@apply border-b-transparent text-gray-500 bg-gray-100;
	}

	.tab-label:hover {
		@apply border-b-gray-300 text-gray-500;
	}

	:global(.dark) .tab-label {
		@apply bg-slate-700 text-slate-400;
	}

	:global(.dark) .tab-label:hover {
		@apply border-b-slate-600 text-slate-300;
	}

	.tab-label.active.generate {
		@apply border-b-generate text-gray-700 bg-generate-light;
	}

	:global(.dark) .tab-label.active.generate {
		@apply bg-slate-800 text-slate-300;
	}

	.tab-label.active.assemble {
		@apply border-b-assemble text-gray-700 bg-assemble-light;
	}

	:global(.dark) .tab-label.active.assemble {
		@apply bg-slate-800 text-slate-300;
	}
</style>

