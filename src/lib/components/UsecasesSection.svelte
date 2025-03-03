<div class="mt-6 text-xl leading-8 text-gray-600 dark:text-slate-400">
	<p>
		DiceSlice can handle files or text up to about 2GB, including things like letters, passwords,
		keys, source code, images, videos, documents, and records. Here are some examples to spark ideas
		for how you can use it.
	</p>
</div>

<div class="mt-10 rounded-xl">
	<h3
		class="text-lg font-semibold tracking-normal text-gray-800 dark:text-slate-100 sm:text-xl mb-4"
	>
		Some examples:
	</h3>

	<div class="text-lg leading-8 text-gray-600 dark:text-slate-400 mb-8">
		<p class="mt-6">Each use case involves the following parameters:</p>
		<ul class="list-disc list-inside mt-2 space-y-2">
			<li><var>secret</var> : any file or text</li>
			<li>
				<var>n</var> : number of slice files to be generated
			</li>
			<li>
				<var>t</var> : number of slice files required to unlock the secret (threshold)
			</li>
		</ul>
	</div>
	<dl class="grid grid-cols-1 gap-x-8 gap-y-8 text-base leading-7 sm:grid-cols-2 lg:grid-cols-2">
		<div
			class="bg-gray-100 dark:bg-slate-800 p-4 xl:p-6 border border-gray-200 dark:border-slate-800 rounded-xl"
		>
			<h4>Safely store your crypto</h4>
			<div class="flex flex-col gap-y-2 mt-3 text-gray-600 dark:text-slate-400">
				<p>
					<span class="text-generate mr-2 font-bold">Generate:</span>
					Use for example <var>&lt;bitcoin seed phrase&gt;</var> to create <var>n</var> slice files.
				</p>
				<p>
					<span class="text-gray-400 mr-2 font-bold">Store:</span>
					Store it in different physical locations, such as a USB drive under your mattress, in the cloud,
					and a USB drive at your friend's, etc.
				</p>
				<p>
					<span class="text-assemble mr-2 font-bold">Assemble:</span>
					To retrieve your passwords, you must have access to at least <var>t</var> locations.
				</p>
			</div>
		</div>
		<div
			class="bg-gray-100 dark:bg-slate-800 p-4 xl:p-6 border border-gray-200 dark:border-slate-800 rounded-xl"
		>
			<h4>Disclose information conditionally</h4>
			<div class="flex flex-col gap-y-2 mt-3 text-gray-600 dark:text-slate-400">
				<p>
					<span class="text-generate mr-2 font-bold">Generate:</span>
					Draft your will in a file like <var>exit_strategy.pdf</var> and generate <var>n</var> slice
					files.
				</p>
				<p>
					<span class="text-gray-400 mr-2 font-bold">Share:</span>
					Share with <var>n</var> loved ones and your attorney.
				</p>
				<p>
					<span class="text-assemble mr-2 font-bold">Assemble:</span>
					Your will shall only be disclosed when <var>t</var> of them jointly decide the appropriate
					time has come.
				</p>
			</div>
		</div>
		<div
			class="bg-gray-100 dark:bg-slate-800 p-4 xl:p-6 border border-gray-200 dark:border-slate-800 rounded-xl"
		>
			<h4>Protect your assets</h4>
			<div class="flex flex-col gap-y-2 mt-3 text-gray-600 dark:text-slate-400">
				<p>
					<span class="text-generate mr-2 font-bold">Generate:</span>
					Generate slice files from <var>&lt;Vault PIN&gt;</var> of a vault with your organization's
					most crucial assets.
				</p>
				<p>
					<span class="text-gray-400 mr-2 font-bold">Share:</span>
					Share them amongst <var>n</var> trusted (but not <i>that</i> trusted) members of your organisation.
				</p>
				<p>
					<span class="text-assemble mr-2 font-bold">Assemble:</span>
					No single person can access the vault alone; it requires consensus among <var>t</var> members
					to assemble the PIN and open the vault.
				</p>
			</div>
		</div>
		<div
			class="bg-gray-100 dark:bg-slate-800 p-4 xl:p-6 border border-gray-200 dark:border-slate-800 rounded-xl"
		>
			<h4>Transmit secrets</h4>
			<div class="flex flex-col gap-y-2 mt-3 text-gray-600 dark:text-slate-400">
				<p>
					<span class="text-generate mr-2 font-bold">Generate:</span>
					Generate slice files of a secret file such as <var>nuke_launch_codes.txt</var>
				</p>
				<p>
					<span class="text-gray-400 mr-2 font-bold">Send:</span>
					Send through <var>n</var> channels, without a password or a key. For example one by e-mail,
					one by courier, one by SMS, etc.
				</p>
				<p>
					<span class="text-assemble mr-2 font-bold">Assemble:</span>
					The secret can only be read by the receiver if they have access to at least <var>t</var> channels.
				</p>
			</div>
		</div>
	</dl>
</div>

<style>
	@reference "../../app.css";

	var {
		@apply tracking-normal font-mono not-italic text-gray-700 bg-gray-100 font-semibold inline-flex items-center rounded-lg px-2;
	}
	:global(.dark) var {
		@apply text-slate-300 bg-slate-800;
	}
	
	h4 {
		@apply font-semibold text-gray-900 leading-10;
	}
	:global(.dark) h4 {
		@apply text-slate-300;
	}
</style>
