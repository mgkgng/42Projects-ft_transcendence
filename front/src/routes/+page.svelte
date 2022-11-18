<script lang="ts">
	import '$lib/stores/client';
	import '$lib/scss/app.scss';
	import Title from "$lib/Title.svelte";
	import { client } from "$lib/stores/client";
    import { onMount } from "svelte";
    import { loginState } from "$lib/stores/var";
    import { browser } from "$app/environment";
    import Header from "$lib/header/Header.svelte";
	import Modal from '$lib/tools/Modal.svelte';
	import Room from "$lib/game/Room.svelte";
	import Message from '$lib/modals/Message.svelte';
	import PlayOrChat from "$lib/modals/PlayOrChat.svelte";
    import CreateGame from "$lib/modals/CreateGame.svelte";
    import EnterGame from "$lib/modals/EnterGame.svelte";
    import RoomList from "$lib/modals/RoomList.svelte";
	// import { chatRoom } from '$lib/stores/chatRoom';

	let roomModal: any;
	let roomId: string = "";

	let messageModal: any;
	let modalMessage: string = "";

	let roomListModal: any;
	let enterModal: any;
	let enterGameModal: any;
	let createGameModal: any;


	onMount(() => {
		if (!browser || !$client.socket)
			return ;

		$client.socket.on("RoomCreated", (data: any) => {
			console.log("RoomCreated", data);
			roomId = data;
			roomModal.open();
		});

		$client.socket.on("JoinRoomRes", (data: any) => {
			console.log('JoinRes', data);
			if (data.allowed) {
				roomId = data.roomId;
				roomListModal.close();
				console.log("why not openend?");
				roomModal.open();
				console.log("really, why?");
				return ;
			} else {
				modalMessage = "You cannot enter this room";
				messageModal.open();
			}	
		});
	});
</script>

<Modal bind:this={enterModal}>
	<PlayOrChat itself={enterModal} enterGameModal={enterGameModal}/>
</Modal>

<Modal bind:this={createGameModal}>
	<CreateGame itself={createGameModal} enterGameModal={enterGameModal}/>
</Modal>

<Modal bind:this={enterGameModal}>
	<EnterGame itself={enterGameModal} createGameModal={createGameModal} roomListModal={roomListModal}/>
</Modal>

<Modal bind:this={roomListModal}>
	<RoomList itself={roomListModal} enterGameModal={enterGameModal}/>
</Modal>

<Modal bind:this={messageModal}>
	<Message itself={messageModal} msg={modalMessage}/>
</Modal>

<Modal bind:this={roomModal} closeOnBgClick={false}>
	<Room itself={roomModal} roomId={roomId}/>
</Modal>

<Header />
<Title title={"TRANSCENDENCE"} roomListModal={roomListModal} enterModal={enterModal}
	enterGameModal={enterGameModal} createGameModal={createGameModal}/>