<style lang="scss">
	.container {
		max-height: 100%;
		background-color: rgba(0, 0, 0, 0);
		display: grid;
		grid-template-rows: 90vh 10vh;
		gap: 0;
		padding: 0;
	}

</style>

<script lang="ts">
	import Title from "$lib/Title.svelte";
	import DarkMode from "$lib/DarkMode.svelte";

	import { client } from "$lib/stores/client";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

	onMount(() => {
		console.log("I'm on the main page.");
		
		$client.addListener("MatchFound", (data: any) => {
			console.log("MatchFound", data);
			goto(`/play/${data}`);
		});


		$client.addListener("RoomCreated", (data: any) => {
			console.log("RoomCreated", data);

			goto('/play/' + data);
		});

		return (() => {
			$client.removeListeners(["MatchFound", "RoomCreated"]);
		})

	});
</script>

<div class="container">
	<Title title={"transcendence"} mainPage={true} />
</div>

