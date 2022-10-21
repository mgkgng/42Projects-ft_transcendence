<style lang="scss">

</style>

<script lang="ts">
    import { client } from "$lib/stores/client";
    import { user } from "$lib/stores/user";
    import { onMount } from "svelte";
	import { page } from '$app/stores';
    import { goto } from "$app/navigation";

	export let loginState;

	onMount(() => {
		const code = String($page.url).split('code=')[1];
		console.log('code: ', code);
		console.log(`${encodeURIComponent(location.origin)}`);

		if (!code)
			goto(`https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-f5ff5811f4e28fa86f612098072826a0d1e9b5dd48ca96888a53143c89c113f0&redirect_uri=${encodeURIComponent(location.origin)}%2Flogin&response_type=code`);
		else {
			$client.sock.send({
				event: "askToken",
				data: code
			});
		}

		return (() => {
			$client.removeListeners(['getToken', 'tokenError']);
		})
	});
</script>

<div class="container">
	{#if !error}
	<div class="loading">LOADING...</div>
	{:else}
	<div>Login Error</div>
	{/if}
</div>
