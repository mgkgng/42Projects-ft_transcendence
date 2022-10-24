<style lang="scss">
	.container {
		width: 100%;
		height: 100%;
		max-height: 100%;
		background-color: rgba(0, 0, 0, 0);
		display: flex;
		gap: 0;
		padding: 0;
	}

	@keyframes size-change {
		0% { transform: scale(1) }
		50% { transform: scale(1.3) }
		100% { transform: scale(1) }
	}
</style>

<script lang="ts">
	import '$lib/scss/app.scss';
	import Title from "$lib/Title.svelte";
	import DarkMode from "$lib/DarkMode.svelte";

	import { client } from "$lib/stores/client";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { loginState } from "$lib/stores/var";
    import { browser } from "$app/environment";
    import Header from "$lib/header/Header.svelte";

	let roomId: string = "";

	onMount(() => {
		console.log("I'm on the main page.");

		if (!browser || !loginState || !$client.socket)
			return;
		
		$client.socket.on("MatchFound", (data: any) => {
			console.log("MatchFound", data);
			goto(`/play/${data}`);
		});
	});
</script>

<Header />
<Title title={"TRANSCENDENCE"} mainPage={true} />
<DarkMode/>
