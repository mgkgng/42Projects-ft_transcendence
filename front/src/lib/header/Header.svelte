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
			object-fit: cover;

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
			width: 75px;
			height: 75px;
			object-fit: cover;
			border-radius: .4em;
		}

		@keyframes grow {
			0% {
				transform: scaleY(0);
				opacity: 0;
			}
			to {
				transform: scaleY(1);
				opacity: 1;
			}
		}
		.menu {
			// display: none;
			position: absolute;
			top: 85px;
			right: 0;
			border: 2px solid #fff;
			border-radius: .3em;

			color: #fff;
			z-index: 9999;
			transform-origin: top;
	
			&::before {
				content: "";
				top: -20px;
				right: 9px;
				left: auto;
				border: 8px solid transparent;
				border-bottom-color: transparent;
				border-bottom-color: #fff;
				position: absolute;
				display: inline-block;
			}
	
			button {
				width: 100%;
				padding: 1em 1.2em;
				cursor: pointer;
				display: flex;
				text-align: center;
				transition: .1s;

				&:hover {
					background-color: transparentize(#fff, .6); //TODO color decide
				}
			}
		}
		&:focus-within .menu {
			display: block;
			animation: grow .2s ease-in-out;
		}
	}

	.chat{
		position: absolute;
		top: 0;
		left: 0;
		float: right;
		border: 2px solid transparentize(#fff, .5);
		color: transparentize(#fff, .5);
		font-size: 15px;
		padding: .2em;

		width: 45px;
		height: 45px;
		border-radius: .4em;
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

	let openMenu: boolean;

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
	<!-- <div class="logo" on:click={() => {
		goto('/');
	}}>
		<img src="/logot.svg" alt="logo">
	</div> -->

	<div class="profile">
		<div class="summary">
			{#if !$user}
			<img src="/pingu/pingu-coucou.jpeg" alt="pingu-coucou">
			{:else}
			<img src={$user.image_url} alt="profile" />
			{/if}
		</div>
		<div class="menu">
			<button on:click={()=>{profileModal.open();}}>Profile</button>
			<button>Friends</button>
			<button>Setting</button>
			<button>Logout</button>
		</div>
	</div>
	<div class="chat" on:click={() => {
		chatModal.open();
	}}>
		<p>chat test</p>
	</div>
</header>