<style lang="scss">

</style>

<script lang="ts">
	import '$lib/scss/app.scss';
	import Title from "$lib/Title.svelte";

	import { client } from "$lib/stores/client";
    import { onMount } from "svelte";
    import { loginState } from "$lib/stores/var";
    import { browser } from "$app/environment";
    import Header from "$lib/header/Header.svelte";

	onMount(() => {
		if (!browser || !loginState || !$client.socket)
			return;
	});
</script>

<Header />
<Title title={"TRANSCENDENCE"} mainPage={true} />