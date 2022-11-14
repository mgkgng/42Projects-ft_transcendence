<style lang="scss">
	.container {
		gap: 3em;
	}

	button {
		width: 140px;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		overflow: hidden;
		cursor: pointer;
		color: #e6e6e6;
		backdrop-filter: blur(6px);
		border: 2px solid transparentize(#fff, .6);
		text-align: center;
		font-size: 25px;
		display: flex;
		justify-content: center;
		align-items: center;

		transition: .2s;

		&:hover {
			filter: brightness(85%);
			transform: translateY(-5px);
		}
	}

	.play {
		background-color: $main-bright;
	}

	.chat {
		background-color: $submain-lowshadeblue;
	}
</style>

<script lang="ts">
    import Modal from "$lib/tools/Modal.svelte";
    import CreateGame from "$lib/modals/CreateGame.svelte";
    import EnterGame from "$lib/modals/EnterGame.svelte";
    import RoomList from "$lib/modals/RoomList.svelte";
    import ChatRoom from "$lib/modals/ChatRoom.svelte";
	import AllChatRooms from "./allChatRooms.svelte";
    import AxelUserProfile from "./AxelUserProfile.svelte";
	

	export let itself: any;

	let enterGameModal: any;
	let createGameModal: any;
	let roomListModal: any;

	let chatModal: any;
	let axelUserProfileModal : any;
	let allChatModal : any;
	
</script>

<Modal bind:this={enterGameModal} closeOnBgClick={true}>
	<EnterGame itself={enterGameModal} createGameModal={createGameModal} roomListModal={roomListModal}/>
</Modal>

<Modal bind:this={createGameModal} closeOnBgClick={true}>
	<CreateGame itself={createGameModal} enterGameModal={enterGameModal}/>
</Modal>

<Modal bind:this={roomListModal} closeOnBgClick={true}>
	<RoomList itself={roomListModal} enterGameModal={enterGameModal}/>
</Modal>

<Modal bind:this={chatModal} closeOnBgClick={true}>
	<ChatRoom itself={chatModal} axelUserProfileModal={axelUserProfileModal} allChatModal={allChatModal} />
</Modal>
<Modal bind:this={allChatModal} closeOnBgClick={true} >
	<AllChatRooms itself={allChatModal} ChatRoomsModal={chatModal}/>
</Modal>
<Modal bind:this={axelUserProfileModal} closeOnBgClick={true} >
	<AxelUserProfile itself={axelUserProfileModal} ChatRoomsModal={chatModal}/>
</Modal>

<div class="flex container">
	<button class="play" on:click={()=>{
		enterGameModal.open();
		// itself.close();
	}}>Play</button>
	<button class="chat" on:click={()=>{
		chatModal.open();
		// itself.close();
	}}>Chat</button>
</div>