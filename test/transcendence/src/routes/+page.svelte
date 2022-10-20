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
	import CreateGame from "$lib/modals/CreateGame.svelte";
	import Modal from "$lib/tools/Modal.svelte";

	import { client } from "$lib/stores/client";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import RoomList from "$lib/modals/RoomList.svelte";
    import Room from "$lib/modals/Room.svelte";

	let createGameModal: any;
	let roomListModal: any;
	let roomModal: any;
	let roomId: string = "";

	let menuExpanded: boolean;

	onMount(() => {	
		// console.log("hello?");	
		$client.addListener("MatchFound", (data: any) => {
			console.log("MatchFound", data);
			roomId = data;
			$client.room = data;
			roomModal.open();
		});

		$client.addListener("RoomCreated", (data: any) => {
			console.log("RoomCreated", data);
			roomId = data;
			$client.room = data;
			createGameModal.close();
			menuExpanded = false;
			roomModal.open();
		});

		return (() => {
			$client.removeListeners(["MatchFound", "RoomCreated"]);
		})
	});
</script>

<Modal bind:this={createGameModal} closeOnBgClick={true}>
	<CreateGame />
</Modal>

<Modal bind:this={roomListModal} closeOnBgClick={true}>
	<RoomList />
</Modal>

<Modal bind:this={roomModal} closeOnBgClick={false}>
	<Room roomId={roomId}/>
</Modal>

<div class="container">
	<Title title={"transcendence"} mainPage={true} />
</div>
<DarkMode/>
<MenuCircle createGameModal={createGameModal} roomListModal={roomListModal} bind:expanded={menuExpanded}/>


