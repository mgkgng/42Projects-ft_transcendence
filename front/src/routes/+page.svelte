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
	import Title from "$lib/Title.svelte";
	import DarkMode from "$lib/DarkMode.svelte";
	import MenuCircle from '$lib/MenuCircle.svelte';
	import CreateGame from "$lib/modals/CreateGame.svelte";
	import Modal from "$lib/tools/Modal.svelte";
	import '$lib/scss/app.scss';

	import { client } from "$lib/stores/client";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { loginState } from "$lib/stores/var";
    import { browser } from "$app/environment";

	import RoomList from "$lib/modals/RoomList.svelte";
    import Room from "$lib/modals/Room.svelte";
    import Header from "$lib/header/Header.svelte";
    // import { user } from "$lib/stores/user";

	let createGameModal: any;
	let roomListModal: any;
	let roomModal: any;

	let roomId: string = "";

	let menuExpanded: boolean;

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

<Modal bind:this={createGameModal} closeOnBgClick={true}>
	<CreateGame />
</Modal>

<Modal bind:this={roomListModal} closeOnBgClick={true}>
	<RoomList />
</Modal>

<Modal bind:this={roomModal} closeOnBgClick={false}>
	<Room roomId={roomId}/>
</Modal>

<Header />

<Title title={"transcendence"} mainPage={true} />

<DarkMode/>

<!-- <MenuCircle createGameModal={createGameModal} roomListModal={roomListModal} bind:expanded={menuExpanded}/> -->

