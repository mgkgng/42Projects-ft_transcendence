<script lang="ts">
	import '$lib/stores/client';
	import '$lib/scss/app.scss';
	import Title from "$lib/Title.svelte";
	import { client } from "$lib/stores/client";
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import Header from "$lib/header/Header.svelte";
	import Modal from '$lib/tools/Modal.svelte';
	import Room from "$lib/game/Room.svelte";
	import Message from '$lib/modals/Message.svelte';
	import PlayOrChat from "$lib/modals/PlayOrChat.svelte";
    import CreateGame from "$lib/game/CreateGame.svelte";
    import EnterGame from "$lib/game/EnterGame.svelte";
    import JoinGame from "$lib/game/JoinGame.svelte";
    import ChatRoom from '$lib/chat/ChatRoom.svelte';
    import { loaded } from '../lib/stores/var';

	let roomModal: any;
	let roomID: string = "";

	let messageModal: any;
	let modalMessage: string = "";

	let joinGameModal: any;
	let enterModal: any;
	let enterGameModal: any;
	let createGameModal: any;
	let chatRoomModal: any;

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
			console.log('JoinRes', data);
			if (data.allowed) {
				roomID = data.roomID;
				joinGameModal.close();
				roomModal.open();
			} else {
				modalMessage = "You cannot enter this room";
				messageModal.open();
			}
		});

		$client.socket.on("askFriendNotification", (data: any) => {
			console.log("Notif", data);
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
			roomModal.open();
		});


		return (() => {
			$client.socket.off("CreateRoomRes", "JoinRoomRes", "JoinQueueError",
				"askFriendNotification", "MatchFound", "CreateRoomError",
				"RoomCheckError");
		});
	});
</script>

<Modal bind:this={chatRoomModal}>
	<ChatRoom itself={chatRoomModal} />
</Modal>

<Modal bind:this={enterModal}>
	<PlayOrChat itself={enterModal} enterGameModal={enterGameModal} chatRoomModal={chatRoomModal}/>
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
	<Message itself={messageModal} msg={modalMessage}/>
</Modal>

<Modal bind:this={roomModal} closeOnBgClick={false}>
	<Room itself={roomModal} roomID={roomID}/>
</Modal>

{#if $loaded}
<Header />
<Title title={"TRANSCENDENCE"} enterModal={enterModal} roomModal={roomModal} bind:roomID={roomID}/>
{/if}