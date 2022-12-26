<script lang="ts">
	import '$lib/stores/client';
	import '$lib/scss/app.scss';
	import { client } from "$lib/stores/client";
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { loaded } from '$lib/stores/var';
    import Header from "$lib/header/Header.svelte";
	import Title from "$lib/home/Title.svelte";
	import Modal from '$lib/tools/Modal.svelte';
	import Room from "$lib/game/Room.svelte";
	import AlertMessage from '$lib/modals/AlertMessage.svelte';
	import Enter from "$lib/modals/Enter.svelte";
    import CreateGame from "$lib/game/CreateGame.svelte";
    import EnterGame from "$lib/game/EnterGame.svelte";
    import JoinGame from "$lib/game/JoinGame.svelte";
    import Rank from '$lib/rank/Rank.svelte';
    import Chat from '$lib/chat/Chat.svelte';
    import { user } from '$lib/stores/user';

	let roomModal: any;
	let roomID: string = "";

	let messageModal: any;
	let modalMessage: string = "";

	let joinGameModal: any;
	let enterModal: any;
	let enterGameModal: any;
	let createGameModal: any;
	let chatModal: any;
	let rankModal: any;

	onMount(() => {
		if (!browser || !$client.socket)
			return ;

		$client.socket.on("CreateRoomError", (data: any) => {
			modalMessage = data;
			messageModal.open();
		});

		$client.socket.on("CreateRoomRes", (data: any) => {
			console.log("RoomCreated", data);
			createGameModal.close();
			roomID = data;
			roomModal.open();
		});

		$client.socket.on("JoinRoomRes", (data: any) => {
			console.log(data);
			joinGameModal.close();
			roomID = data.roomID;
			roomModal.open();
		});

		$client.socket.on("JoinQueueError", (data: any) => {
			modalMessage = data;
			messageModal.open();
		});

		$client.socket.on("RoomCheckError", (data: any) => {
			roomModal.close();
			modalMessage = data;
			messageModal.open();
		});

		$client.socket.on("MatchFound", (data: any) => {
			roomID = data;
			enterGameModal.close();
			roomModal.open();
		});

		$client.socket.on("OnGoingRes", (data: any) => {
			if (data === "") {
				enterModal.close();
				enterGameModal.open();
			} else {
				enterModal.close();
				roomID = data;
				roomModal.open();
			}
		});

		return (() => {
			$client.socket.off("CreateRoomRes");
			$client.socket.off("JoinRoomRes");
			$client.socket.off("JoinQueueError");
			$client.socket.off("MatchFound");
			$client.socket.off("CreateRoomError"); 
			$client.socket.off("RoomCheckError");
		});
	});
</script>

<Modal bind:this={chatModal} closeOnBgClick={false}>
	<Chat itself={chatModal} />
</Modal>

<Modal bind:this={rankModal}>
	<Rank itself={rankModal} />
</Modal>

<Modal bind:this={enterModal}>
	<Enter itself={enterModal} enterGameModal={enterGameModal} rankModal={rankModal} chatModal={chatModal}/>
</Modal>

<Modal bind:this={createGameModal}>
	<CreateGame itself={createGameModal} enterGameModal={enterGameModal}/>
</Modal>

<Modal bind:this={enterGameModal}>
	<EnterGame itself={enterGameModal} createGameModal={createGameModal} joinGameModal={joinGameModal}/>
</Modal>

<Modal bind:this={joinGameModal}>
	<JoinGame itself={joinGameModal} enterGameModal={enterGameModal}/>
</Modal>

<Modal bind:this={messageModal}>
	<AlertMessage itself={messageModal} msg={modalMessage}/>
</Modal>

<Modal bind:this={roomModal} closeOnBgClick={false}>
	<Room itself={roomModal} roomID={roomID}/>
</Modal>

{#if $loaded}
<Header />
<Title title={"TRANSCENDENCE"} enterModal={enterModal} roomModal={roomModal} bind:roomID={roomID} main={true}/>
{/if}