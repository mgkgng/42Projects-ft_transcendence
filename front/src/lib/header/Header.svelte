<style lang="scss">
	header {
		position: absolute;
		width: 100%;
		height: 95px;

		z-index: 9999;

		display: flex;
		flex-direction: row;
	}

	.logo {
		cursor: pointer;
		padding-left: 5px;

		img {
			height: 100%;
			object-fit: contain;

		}
	}

	.profile {
		position: absolute;
		top: 0;
		right: 0;
		float: right;

		// width: 50px;
		width: 75px;
		height: 80%;
		border-radius: 5em;

		cursor: pointer;

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			border-radius: 1em;
		}
	}
	.chat{
		position: absolute;
		top: 75px;
		right: 0;
		float: right;
		background-color: aliceblue;

		width: 70px;
		height: 80%;
		border-radius: 1em;
		text-align: center;
		cursor: pointer;
	}
</style>

<script lang="ts">
    import { goto } from "$app/navigation";
    import UserProfile from "$lib/modals/UserProfile.svelte";
    import ChatModal from "$lib/modals/ChatRoom.svelte";
    import AllChatModal from "$lib/modals/allChatRooms.svelte";
    import AxelUserProfile from "$lib/modals/AxelUserProfile.svelte";
    import { user } from "$lib/stores/user";
    import { loginState } from "$lib/stores/var";
    import Modal from "$lib/tools/Modal.svelte";

	let profileModal: any;
	let chatModal: any;
	let allChatModal: any;
	let login: boolean;
	let userInfo: any;
	let axelProfileModal : any;

	$: console.log("This is user:", $user);


	loginState.subscribe(value => { login = value; })

</script>

<Modal bind:this={profileModal} closeOnBgClick={true}>
	<UserProfile />
</Modal>
<Modal bind:this={chatModal} closeOnBgClick={true}>
	<ChatModal itself={chatModal} allChatRoomsModal={allChatModal} axelUserProfileModal={axelProfileModal}/>
</Modal>
<Modal bind:this={allChatModal} closeOnBgClick={true} >
	<AllChatModal itself={allChatModal} ChatRoomsModal={chatModal}/>
</Modal>
<Modal bind:this={axelProfileModal} closeOnBgClick={true} >
	<AxelUserProfile itself={axelProfileModal} ChatRoomsModal={chatModal}/>
</Modal>
<header>
	<div class="logo" on:click={() => {
		goto('/');
	}}>
		<img src="/logot.svg" alt="logo">
	</div>

	<div class="profile" on:click={() => {
		profileModal.open();
	}}>
		{#if !$user}
		<img src="/pingu/pingu-coucou.jpeg" alt="pingu-coucou">
		{:else}
		<img src={$user.image_url} alt="profile" />
		{/if}
	</div>
	<div class="chat" on:click={() => {
		chatModal.open();
	}}>
		<h4>chat</h4>
	</div>
</header>


