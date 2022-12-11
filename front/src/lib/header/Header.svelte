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
		
		.who {
			position: absolute;
			top: 0;
			right: 0;
			width: 65px;
			height: 65px;
			border: $border;
			border-radius: .3em;
			font-size: 48px;
			font-family: 'fake-receipt';
			color: #fff;
			padding-left: .3em;
			padding-top: .05em;
			background-color: transparentize(#fff, .9);
		}

		.summary {
			position: relative;
			img {
				width: 75px;
				height: 75px;
				object-fit: cover;
				border-radius: .4em;
			}
		}

		p {
			position: absolute;		
			color: #fff;
			width: 10em;
			right: 2em;
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
			top: 115px;
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
				position: relative;
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

		.notif {
			position: absolute;
			top: .5em;
			right: 0;
			width: 15px;
			height: 15px;
			border-radius: 50%;
			border: 2px solid $red-dark;
			background-color: $red;
		}
		.img {
			top: 0;
		}
	}
</style>

<script lang="ts">
    import UserProfile from "$lib/users/UserProfile.svelte";
    import { user } from "$lib/stores/user";
    import { login } from "$lib/stores/var";
    import Modal from "$lib/tools/Modal.svelte";
	import Friends from "$lib/users/Friends.svelte"
    import Settings from "$lib/settings/Settings.svelte";
	import { onMount } from "svelte";
    import { client } from "$lib/stores/client";
    import PrivateMessages from "$lib/users/PrivateMessages.svelte";


	let userProfileModal: any;
	let friendsModal: any;
	let settingsModal: any;
	let privateMessagesModal: any;

	let newMessage: bool = false;
	let newFriendRequest: bool = false;

	let userInfo: any;

	user.subscribe((user: any) => { userInfo = user; });

	onMount(() => {
		if (!$client.socket)
			return ;

		$client.socket.on("newDirectMessage", (data: any) => {
			console.log("message arrived", data); 
		});

		$client.socket.on("askFriendNotification", (data: any) => {
			newFriendRequest = true;
		});

		$client.socket.on("getDirectMessage", (data: any) => {
			newMessage = true;
		});

		return(() => {
			$client.socket.off("newDirectMessage");
			$client.socket.off("askFriendNotification");
			$client.socket.off("getDirectMessage");
		});
	});
</script>

<Modal bind:this={userProfileModal} >
	<UserProfile itself={userProfileModal} profileUser={userInfo} />
</Modal>
<Modal bind:this={friendsModal}>
	<Friends itself={friendsModal} />
</Modal>
<Modal bind:this={settingsModal} closeOnBgClick={false}>
	<Settings itself={settingsModal} />
</Modal>
<Modal bind:this={privateMessagesModal}>
	<PrivateMessages itself={privateMessagesModal} />
</Modal>

<header>
	<div class="profile">
		{#if !userInfo}
		<div class="who">?</div>
		{:else}
		<div class="summary">
			<img src={(!userInfo.img) ? userInfo.img_url : userInfo.img} alt="profile" />
			{#if newMessage || newFriendRequest}
			<div class="notif img"></div>
			{/if}
		</div>
		<!-- <p>Hello {userInfo.username}!</p> -->
		<div class="menu">
			<button on:click={() => { userProfileModal.open(); }}>Profile</button>
			<button on:click={() => {
				friendsModal.open();
				if (newFriendRequest)
					newFriendRequest = false;	
			}}>Friends
				{#if newFriendRequest}<div class="notif"></div>{/if}
			</button>
			<button on:click={() => { settingsModal.open(); }}>Settings</button>
			<button on:click={() => {
				privateMessagesModal.open();
				if (newMessage)
					newMessage = false;
			}}>Messages
				{#if newMessage}<div class="notif"></div>{/if}
			</button>
			<button on:click={() => {
				localStorage.removeItem("transcendence-jwt");
				login.set(false);
				window.location.reload();
			}}>Logout</button>
		</div>
		{/if}
	</div>
</header>