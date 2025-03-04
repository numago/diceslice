<div>
	<div class="mx-auto px-6 lg:px-0">
		<div
			class="flex flex-col lg:flex-row mt-4 space-x-0 lg:space-x-3 space-y-9 lg:space-y-0 mx-auto max-w-2xl text-base text-gray-600 lg:max-w-none"
		>
			<div class="flex-1">
				<div class="relative pl-9 w-full">
					<h3>
						<span class="absolute left-0">🔐</span>
						Data security
					</h3>
					<dl class="grid space-y-3">
						<div>
							<dt>Strong encryption</dt>
							<dd>
								Your data is protected with trusted AES-256-GCM encryption for robust security.
							</dd>
						</div>
						<div>
							<dt>No password required</dt>
							<dd>
								You don't have to choose between a too simple password you can remember and a
								complex one you must write down.
							</dd>
						</div>
					</dl>
				</div>
			</div>
			<div class="flex-1">
				<div class="relative pl-9">
					<h3>
						<span class="absolute left-0">🛡️</span>
						Distributed safeguarding
					</h3>
					<dl class="grid space-y-3">
						<div>
							<dt>Shared control</dt>
							<dd>
								Use multi-person verification to reduce risks and prevent any one person from
								compromising data.
							</dd>
						</div>
						<div>
							<dt>Access distribution</dt>
							<dd>
								Protect your data by spreading slice files across different places, so one
								compromised file doesn't expose your data.
							</dd>
						</div>
					</dl>
				</div>
			</div>
			<div class="flex-1">
				<div class="relative pl-9">
					<h3>
						<span class="absolute left-0"> 🕵️</span>
						Privacy first
					</h3>
					<dl class="grid space-y-3">
						<div>
							<dt>Offline</dt>
							<dd>
								All data is handled offline in your browser, and no personal data is collected.
							</dd>
						</div>
						<div>
							<dt>Open source</dt>
							<dd>
								You can inspect the source code and see how exactly it is built <a
									href="https://github.com/numago/diceslice"
									class="underline">here</a
								>.
							</dd>
						</div>
					</dl>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	@reference "../../app.css";

	h3 {
		@apply font-semibold text-gray-800 text-xl mb-3;
	}
	:global(.dark) h3 {
		@apply text-slate-300;
	}

	dt {
		@apply inline font-semibold text-gray-800 pr-1;
	}
	:global(.dark) dt {
		@apply text-slate-300;
	}

	dd {
		@apply inline text-gray-700;
	}
	:global(.dark) dd {
		@apply text-slate-400;
	}
</style>
