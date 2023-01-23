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

		.menu {
			display: none;
			position: absolute;
			top: 5rem;
			right: 0;
			color: #fff;
			width: 7rem;
			border: 2px solid #fff;
			border-radius: .3em;
			z-index: 9999;
			transform-origin: top;

			&::before {
				content: "";
				top: -16px;
				right: 9px;
				left: auto;
				border: 8px solid transparent;
				border-bottom-color: transparent;
				border-bottom-color: #fff;
				position: absolute;
				display: inline-block;
			}

			button {
				display: flex;
				position: relative;
				width: 100%;
				padding: 1em 1.2em;
				cursor: pointer;
				align-items: center;
				transition: .1s;
				text-align: center;

				&:hover {
					filter: brightness(80%);
					background-color: transparentize(#fff, .6);
				}

				&:nth-child(even):hover { background-color: transparentize(#fff, .6); }

				img {
					height: 1.5em;
				}
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
	}
	.profile:focus-within .menu {
		display: block;
		animation: grow .1s ease-in-out;
	}
	
	@keyframes grow {
		0% {
			transform: scaleY(0);
			opacity: 0;
		}
		100% {
			transform: scaleY(1);
			opacity: 1;
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
    import AlertMessage from "$lib/modals/AlertMessage.svelte";


	let userProfileModal: any;
	let friendsModal: any;
	let settingsModal: any;
	let privateMessagesModal: any;
	let messageModal: any;

	let newMessage: Map<string, boolean> = new Map<string, boolean>();
	let newFriendRequest: Map<string, boolean> = new Map<string, boolean>();

	let modalMessage: string;

	let userInfo: any;
	user.subscribe((user: any) => { userInfo = user; });

	onMount(() => {
		if (!$client.socket)
			return ;

		$client.socket.on("updateFriendAndMessage", (data: any) => {
			console.log("got update", data);

			for (let req of data.requests)
				newFriendRequest.set(req, true);
			newFriendRequest = newFriendRequest;
		});

		$client.socket.on("newMessageArrived", (data: any) => {
			console.log("message arrived", data); 
			newMessage.set(data, true);
			newMessage = newMessage;
		});

		$client.socket.on("askFriendGNotification", (data: any) => {
			newFriendRequest.set(data.friend, true);
			newFriendRequest = newFriendRequest;
		});

		$client.socket.on("unAskFriendGNotification", (data: any) => {
			newFriendRequest.delete(data.friend);
			newFriendRequest = newFriendRequest;
		});

		$client.socket.on("JoinRoomRes", (data: any) => {
			console.log(data);
			privateMessagesModal.close();
		});

		$client.socket.on("JoinRoomError", (data: any) => {
			modalMessage = data;
			messageModal.open();
		});

		$client.socket.emit("reqFriendAndMessage");

		return(() => {
			$client.socket.off("updateFriendAndMessage");
			$client.socket.off("newMessageArrived");
			$client.socket.off("askFriendGNotification");
			$client.socket.off("JoinRoomRes");
			$client.socket.off("JoinRoomError");
		});
	});
</script>

<Modal bind:this={userProfileModal} >
	<UserProfile itself={userProfileModal} profileUser={userInfo} />
</Modal>
<Modal bind:this={friendsModal}>
	<Friends itself={friendsModal} />
</Modal>
<Modal bind:this={settingsModal} closeOnBgClick={true}>
	<Settings itself={settingsModal} />
</Modal>
<Modal bind:this={privateMessagesModal}>
	<PrivateMessages itself={privateMessagesModal} />
</Modal>
<Modal bind:this={messageModal}>
	<AlertMessage itself={messageModal} msg={modalMessage}/>
</Modal>

<header>
	<div class="profile">
		{#if !userInfo}
		<div class="who">?</div>
		{:else}
		<div class="summary" tabindex="-1">
			{#if ((!userInfo.img) ? userInfo.img_url : userInfo.img).includes("cdn.intra.42.fr")}
				<img src="{(!userInfo.img) ? userInfo.img_url : userInfo.img}" alt="profile" />
			{:else}
				<img src="http://{location.hostname}:3000{(!userInfo.img) ? userInfo.img_url : userInfo.img}" alt="profile" />
			{/if}
			{#if newMessage.size || newFriendRequest.size}
			<div class="notif img"></div>
			{/if}
		</div>
		<!-- <p>Hello {userInfo.username}!</p> -->
		<div class="menu">
			<button on:click={() => { userProfileModal.open(); }}>Profile</button>
			<button on:click={() => {
				friendsModal.open();
				if (newFriendRequest.size) {
					$client.socket.emit('requestsChecked');
					newFriendRequest.clear();	
					newFriendRequest = newFriendRequest;
				}
			}}>Friends
				{#if newFriendRequest.size}<div class="notif"></div>{/if}
			</button>
			<button on:click={() => { settingsModal.open(); }}>Settings</button>
			<button on:click={() => {
				privateMessagesModal.open();
				if (newMessage.size) {
					$client.socket.emit('messagesChecked');
					newMessage.clear();	
					newMessage = newMessage;
				}
			}}>Messages
				{#if newMessage.size}<div class="notif"></div>{/if}
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