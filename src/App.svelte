<script lang="ts">
	import './app.css'
	import BrowserStatus from '$lib/components/BrowserStatus.svelte'
	import TheFooter from '$lib/components/TheFooter.svelte'
	import TheHeader from '$lib/components/TheHeader.svelte'
	import FeatureHighlightsSection from '$lib/components/FeatureHighlightsSection.svelte'
	import HowToStepsSection from '$lib/components/HowToStepsSection.svelte'
	import TabsPanel from '$lib/components/TabsPanel.svelte'
	import UsecasesSection from '$lib/components/UsecasesSection.svelte'
</script>

<div class="bg-gray-50 dark:bg-slate-900 min-h-screen">
	<div class="p-2">
		<BrowserStatus />
	</div>
	<TheHeader />
	<main>
		<div class="w-full py-16 text-center">
			<h1
				class="font-semibold tracking-wide text-gray-900 dark:text-slate-100 text-2xl sm:text-3xl mb-7"
			>
				<span class="font-marker">Simple &amp; Secure</span><br />
				<span class="text-4xl sm:text-5xl">Secret Sharing</span>
			</h1>

			<div class="mx-auto px-6 lg:px-0">
				<div class="flex flex-col gap-y-3">
					<p
						class="mx-auto max-w-2xl text-xl md:leading-8 tracking-normal font-medium text-gray-600 dark:text-slate-400"
					>
						Protect your data by dividing it into encrypted files.
					</p>
					<p
						class="mx-auto max-w-2xl text-xl md:leading-8 tracking-normal font-medium text-gray-600 dark:text-slate-400"
					>
						Only by combining a number of these files, can your data be recovered.
					</p>
					<p
						class="mx-auto max-w-2xl text-xl md:leading-8 font-marker text-gray-600 dark:text-slate-400"
					>
						No passwords required!
					</p>
				</div>
			</div>
		</div>

		<div class="bg-slate-950 w-full py-8 sm:py-12 mb-16 dark">
			<div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
				<div class="px-2">
					<h2
						class="font-semibold tracking-normal text-gray-800 dark:text-slate-100 text-2xl sm:text-4xl mb-6 sm:mb-10"
					>
						Get started
					</h2>
					<div class="grid grid-cols-12 gap-x-6 gap-y-10 md:gap-x-12 md:gap-y-8">
						<div class="lg:col-span-6 col-span-12 order-1 lg:order-none">
							<div class="mb-8 px-0">
								<TabsPanel />
							</div>
						</div>
						<div class="lg:col-span-6 col-span-12 order-0 lg:order-none hidden sm:block">
							<div class="lg:pt-16 mb-8">
								<object
									data="/diceslice-flowchart-light.svg"
									type="image/svg+xml"
									class="w-full italic dark:hidden max-h-96 lg:max-h-full"
									aria-hidden="true"
									title="Diceslice flowchart (light)"
								>
								</object>
								<object
									data="/diceslice-flowchart-dark.svg"
									type="image/svg+xml"
									class="w-full italic hidden dark:block max-h-96 lg:max-h-full"
									aria-hidden="true"
									title="Diceslice flowchart (dark)"
								>
								</object>
							</div>
						</div>
					</div>
				</div>

				<div class="col-span-12 lg:col-span-12">
					<div class="my-6 px-2">
						<h2
							class="text-3xl font-semibold tracking-normal text-gray-800 dark:text-slate-100 sm:text-4xl"
						>
							How to use DiceSlice?
						</h2>
						<div class="my-12">
							<HowToStepsSection />
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="flex flex-col mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
			<div class="col-span-12 lg:col-span-12">
				<div class="px-2">
					<h2
						class="text-3xl font-semibold tracking-normal text-gray-800 dark:text-slate-100 sm:text-4xl"
					>
						Why use DiceSlice?
					</h2>
					<div class="my-12">
						<FeatureHighlightsSection />
					</div>
				</div>
			</div>

			<div class="col-span-12 order-1">
				<div class="py-8 sm:py-16 px-2">
					<h2
						class="text-3xl font-semibold tracking-normal text-gray-800 dark:text-slate-100 sm:text-4xl"
					>
						Use cases
					</h2>
					<div class="my-12">
						<UsecasesSection />
					</div>
				</div>
			</div>
		</div>
	</main>
	<TheFooter />
</div> 