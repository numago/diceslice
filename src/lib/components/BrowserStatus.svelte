<script lang="ts">
	import { isWebCryptoSupported } from '$lib/webCrypto'
	import ErrorAlert from './ErrorAlert.svelte'
	const supported = isWebCryptoSupported()
</script>

{#if !supported}
	<ErrorAlert title="Browser not supported :( ">
		We're sorry, but it seems that your current browser does not support the
		<a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API" class="underline"
			>Web Crypto API</a
		>, which is essential for this application to function. Please consider updating your browser to
		the latest version or switching to a modern browser that supports this feature.
	</ErrorAlert>
{/if}
