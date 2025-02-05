<script lang="ts">
	import ErrorAlert from './ErrorAlert.svelte'

	const isWebCryptoSupported = () => {
		const isSupported = globalThis.crypto?.subtle !== undefined
		if (!isSupported) {
			console.error(
				'Web Crypto API is not supported in the runtime environment. Note: Web Crypto API is available only in secure contexts (HTTPS), in some or all supporting browsers.'
			)
		}
		return isSupported
	}

	const isCompressionSupported = () => {
		const isSupported = globalThis.CompressionStream !== undefined
		if (!isSupported) {
			console.error('CompressionStream is not supported in the runtime environment.')
		}
		return isSupported
	}

	const isBrowserSupported = () => {
		return isWebCryptoSupported() && isCompressionSupported()
	}
</script>

{#if !isBrowserSupported()}
	<ErrorAlert title="Browser not supported :( ">
		We're sorry, but it seems that your current browser does not support one or more required
		features:
		<ul class="list-disc ml-6 mt-2">
			{#if !isWebCryptoSupported()}
				<li>
					<a
						href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API"
						class="underline">Web Crypto API</a
					>
				</li>
			{/if}
			{#if !isCompressionSupported()}
				<li>
					<a
						href="https://developer.mozilla.org/en-US/docs/Web/API/CompressionStream"
						class="underline">CompressionStream API</a
					>
				</li>
			{/if}
		</ul>
		<p class="mt-4">
			Please consider updating your browser to the latest version or switching to a modern browser
			that supports these features.
		</p>
	</ErrorAlert>
{/if}
