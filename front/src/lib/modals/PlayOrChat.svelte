<style lang="scss">
	.buttons { gap: 3em; }

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

	.play { background-color: $main-bright; }
	.chat { background-color: $submain-lowshadeblue; }
</style>

<script lang="ts">
    import Modal from "$lib/tools/Modal.svelte";
    import ChatRoom from "$lib/modals/ChatRoom.svelte";
	import AllChatRooms from "./allChatRooms.svelte";
    import AxelUserProfile from "./AxelUserProfile.svelte";
	

	export let itself: any;
	export let enterGameModal: any;

	let chatModal: any;
	let axelUserProfileModal : any;
	let allChatModal : any;
	
</script>

<Modal bind:this={chatModal} closeOnBgClick={true}>
	<ChatRoom itself={chatModal} axelUserProfileModal={axelUserProfileModal} allChatModal={allChatModal} />
</Modal>
<Modal bind:this={allChatModal} closeOnBgClick={true} >
	<AllChatRooms itself={allChatModal} ChatRoomsModal={chatModal}/>
</Modal>
<Modal bind:this={axelUserProfileModal} closeOnBgClick={true} >
	<AxelUserProfile itself={axelUserProfileModal} ChatRoomsModal={chatModal}/>
</Modal>

<div class="flex buttons">
	<button class="play" on:click={()=>{
		enterGameModal.open();
		itself.close();
	}}>Play</button>
	<button class="chat" on:click={()=>{
		chatModal.open();
		itself.close();
	}}>Chat</button>
</div>