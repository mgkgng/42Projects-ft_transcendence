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
	import DarkMode from '$lib/DarkMode.svelte';
    import MenuCircle from '$lib/MenuCircle.svelte';
	import CreateGame from "$lib/CreateGame.svelte";
	import Modal from "$lib/tools/Modal.svelte";

	import { client } from "$lib/stores/client";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

	let createGameModal: any;

	onMount(() => {
		console.log("I'm on the main page.");
		
		$client.addListener("MatchFound", (data: any) => {
			console.log("MatchFound", data);
			$client.room = data;
			goto(`/play/${data}`);
		});


		$client.addListener("RoomCreated", (data: any) => {
			console.log("RoomCreated", data);
			$client.room = data;
			createGameModal.close();
			goto(`/play/${data}`);
		});

		return (() => {
			$client.removeListeners(["MatchFound", "RoomCreated"]);
		})
	});
</script>

<Modal bind:this={createGameModal} closeOnBgClick={true}>
	<CreateGame />
</Modal>

<div class="container">
	<Title title={"transcendence"} mainPage={true} />
</div>
<DarkMode/>
<MenuCircle createGameModal={createGameModal}/>


