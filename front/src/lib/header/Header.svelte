<style lang="scss">
	header {
		position: absolute;
		width: 100%;
		height: 95px;

		z-index: 9999;

		display: flex;
		flex-direction: row;
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
					filter: brightness(80%);
					background-color: transparentize(#fff, .6);
				}
				// &:nth-child(odd):hover { background-color: transparentize(#fff, .6); }
				// &:nth-child(even):hover { background-color: transparentize(#fff, .6); }
			}
		}
		&:focus-within .menu {
			display: block;
			animation: grow .2s ease-in-out;
		}
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
    import Setting from "../modals/Setting.svelte";
    import ChatDirectBox from "$lib/modals/ChatDirectBox.svelte";
	import Friends from "$lib/modals/Friends.svelte"
    import NewChatRoom from "$lib/modals/NewChatRoom.svelte";

	let profileModal: any;
	let chatModal: any;
	let login: boolean;
	let settingModal: any;
	let chatDirectModal : any;
	let friendsModal: any;

	let lol: any;

	loginState.subscribe(value => { login = value; })

	function handleLogout() {
		localStorage.removeItem("transcendence-jwt");
		loginState.set(false);
		window.location.reload();
	}

</script>

<Modal bind:this={profileModal} closeOnBgClick={true}>
	<UserProfile />
</Modal>
<Modal bind:this={settingModal} closeOnBgClick={true} >
	<Setting itself={settingModal}/>
</Modal>
<Modal bind:this={chatDirectModal} closeOnBgClick={true}>
	<ChatDirectBox />
</Modal>
<Modal bind:this={friendsModal} closeOnBgClick={true}>
	<Friends itself={friendsModal} />
</Modal>
<Modal bind:this={lol} closeOnBgClick={true}>
	<NewChatRoom itself={lol} />
</Modal>


<header>
	<div class="profile">
		<div class="summary">
			{#if !$user}
			<img src="/pingu/pingu-coucou.jpeg" alt="pingu-coucou">
			{:else}
			<img src={$user.image_url} alt="profile" />
			{/if}
		</div>
		<div class="menu">
			<button on:click={()=>{ profileModal.open(); }}>Profile</button>
			<button on:click={()=>{ friendsModal.open(); }}>Friends</button>
			<button on:click={()=>{ lol.open(); }}>ChatDirect</button>
			<button on:click={()=>{ settingModal.open(); }}>Setting</button>
			<button on:click={handleLogout}>Logout</button>
		</div>
	</div>
</header>