<style lang="scss">

</style>

<script lang="ts">
    import { client } from "$lib/stores/client";
    import { user } from "$lib/stores/user";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

	export let loginState: boolean;

	onMount(() => {
		console.log("coucou");

		return (() => {
			$client.removeListeners(['getToken', 'tokenError']);
		})
	});
</script>

<div class="container">
	{#if !loginState}
	<div class="loading">LOADING...</div>
	{/if}
</div>
