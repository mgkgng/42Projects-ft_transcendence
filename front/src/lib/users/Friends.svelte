<style lang="scss">
	.friends {
		width: 360px;
		height: 480px;
		padding-bottom: .2em;
		padding-right: .5em;
		gap: .2em;

		h2 {
			padding-bottom: .2em;
			width: 85%;
			border-bottom: $border-thin;
		}
		.update {
			position: absolute;
			padding: .2em;
			right: 3.3em;
			top: 2.2em;
			border-radius: 50%;
			img {
				width: 32px;
			}
			&:hover {
				background-color: transparentize(#fff, .6);
				transform: scale(1.05);
			}
			&:active{
				transform: scale(1);
			}
		}

		.not-loaded {
			position: absolute;
			top: 50%;
			left: 40%;
			.loading {
				position: relative;
			}
		}
		.search {
			position: absolute;
			top: 1.6em;
			right: 1em;
			padding: .5em;
			border-radius: 50%;
			transition: .1s;
			cursor: pointer;
			
			img {
				width: 2em;
			}

			&:hover {
				background-color: transparentize(#fff, .9);
			}
		}

		.search-bar {
			position: relative;
			
			input {
				width: 85%;
				height: 2em;
				background-color: transparentize(#fff, .8);
				padding: .5em;
				border: $border-thin;
				border-radius: .2em;

				&:focus { background-color: transparentize(#fff, .5); }
			}

			.result {
				position: absolute;
				top: 2em;
				width: 85%;
				background-color: transparentize(#fff, .8);
				border-radius: .1em;

				.line {
					padding: .5em .6em;
					gap: .4em;
					cursor: pointer;
					align-items: center;

					img {
						margin-left: .2em;
						width: 25px;
						height: 25px;
						object-fit: cover;
						border-radius: 50%;
					}

					.status {
						width: 8px;
						height: 8px;
						border-radius: 50%;
						background-color: $grey;
					}
					.online { background-color: $green; }
					.playing { background-color: $red; }

					&:hover { background-color: transparentize($main-dark, .7); }
				}

				p {
					padding: 0 .6em;
					padding-bottom: .4em;
				}	
			}
		}

		.friends-list {
			margin-top: 1em;
			padding-left: .2em;
			gap: .8em;
			overflow-y: scroll;

			width: 100%;
			height: 80%;
			border: none;

			.line {
				position: relative;

				.friend {
					width: 60%;
					cursor: pointer;
					border-radius: .2em .2em 3em .2em;
					transition: .3s;
					padding: 1em;

					&:hover {
						background-color: transparentize($main-light, .3);
						filter: saturate(50%);
					}
				}
				.tools {
					padding: 0;
					position: absolute;
					right: 2em;
					width: 7em;
					height: 100%;
					float: right;
					justify-content: flex-end;
					gap: 0;
					align-items: center;

					border-radius: 3em .2em .2em .2em;

					img { height: 1.2em; }

					&:hover {
						background-color: transparentize($submain-lowshadeblue, .3);
						filter: saturate(50%);
					}

					button {
						width: 2.5em;
						height: 2.5em;
						border-radius: 50%;
						transition: .3s;
						
						&:hover {
							background-color: transparentize(#fff, .8	);
						}
					}
				}
			}
		}

		.requests {
			width: 90%;
			max-height: 35%;
			overflow-y: overlay;
			gap: .2em;
			border: $border;
			border-radius: .2em;

			justify-content: space-between;
			
			.line {
				padding: .5em .5em;
				align-items: center;
				display: grid;
				grid-template-columns: 12% 40% 35%;

				.user {
					transition: .2s;
					padding: .1em .3em;
					border-radius: .2em;
					font-size: 15px;
					cursor: pointer;

					p {
						border-radius: .3em;
						padding: 0 .1em;
						&:hover {
							background-color: transparentize(#fff, .6);
						}
					}
				}
				img {
					width: 45px;
					height: 45px;
					border-radius: 50%;
					object-fit: cover;
				}
				.buttons {
					gap: .2em;
					font-size: 13px;

					button {
						background-color: $red;
						border-radius: .2em;
						width: 4em;
						height: 2em;
						transition: .2s;
						&:first-child { background-color: $green; }
						&:hover {
							transform: scale(1.05);
						}
					}
				}
			}
		}

		.no-friend {
			padding-left: 3em;
			padding-bottom: 3em;
			height: 80%;
			display: flex;
			align-items: center;
		}
	}
</style>

<script lang="ts">
    import CloseButton from "$lib/items/CloseButton.svelte";
	import { client } from "$lib/stores/client";
    import { onMount } from "svelte";
    import { user } from "$lib/stores/user";
    import Modal from "$lib/tools/Modal.svelte";
    import UserProfile from "$lib/users/UserProfile.svelte";
	import WriteMessage from "$lib/users/WriteMessage.svelte";

	export let itself: any;

	let writeMessageModal: any;
	let destMsg: Array<string> = [];

	let loadedRequests: boolean = false;
	let loadedFriends: boolean = false;

	let userInfo: any;
	user.subscribe((user: any) => { userInfo = user; });

	let friends: Map<string, any>;
	let friendRequests: Map<string, any>;
	let searchUser: string = "";
	let userSearchList: Array<any> = [];
	let userProfileModal: any;
	let profileUser: any;

	$: searchUser = "";
	$: searchUser = searchUser.toLowerCase();
	$: { $client.socket.emit("getUserinDB", {username: searchUser}); }

	onMount(() => {
		$client.socket.on("error_getFriendList", (data: any) => {
			console.log("Error!");
		});

		$client.socket.on("success_getFriendList", (data: any) => {
			loadedFriends = false;
			friends = new Map<string, any>();
			for (let friend of data.friends)
				friends.set(friend.username, friend);
			friends = friends;
			loadedFriends = true;
		});

		$client.socket.on("success_getUserinDB", (data: any) => {
			userSearchList = data.users; });
		$client.socket.on("error_getUserinDB", (data: any) => { userSearchList = []; });

		$client.socket.on("resUserProfile", (data: any) => {
			// profileUser = data;
			// userProfileModal.open();
		});

		// TODO websocket to receive request while client is on the modal
		// $client.socket.on("askFriendNotification", (data: any) => {
		// 	// TODO turn off the notif <- notif should be a writable
		// 	newFriendRequest = true;
		// });

		$client.socket.on("success_getAskList", (data: any) => {
			loadedRequests = false;
			friendRequests = new Map<string, any>();
			for (let request of data.friends)
				friendRequests.set(request.username, request);
			friendRequests = friendRequests;
			setTimeout(() => {
				loadedRequests = true;
			}, 200);
		});

		$client.socket.on("success_removeFriend", (data: any) => {
			friends.delete(data.friend);
			friends = friends;
		});

		$client.socket.on("success_acceptFriend", (data: any) => {
			friends.set(data.friend, friendRequests.get(data.friend));
			friendRequests.delete(data.friend);
			friends = friends;
			friendRequests = friendRequests;
		});

		$client.socket.on("success_refuseFriend", (data: any) => {
			friendRequests.delete(data.friend);
			friendRequests = friendRequests;
		});

		$client.socket.on("error_getAskList", (data: any) => {
			console.log("error: ", data);
		});

		$client.socket.emit("getFriendList", { username: userInfo.username });
		$client.socket.emit("getAskList");

		return (() => {
			$client.socket.off("error_getFriendList");
			$client.socket.off("success_getUserinDB");
			$client.socket.off("success_getFriendList");
			$client.socket.off("error_getUserinDB");
			$client.socket.off("resUserProfile");
			$client.socket.off("success_removeFriend");
			$client.socket.off("success_acceptFriend");
			$client.socket.off("success_refuseFriend");
			$client.socket.off("success_getAskList");
		});
	});
</script>

<Modal bind:this={userProfileModal}>
	<UserProfile itself={userProfileModal} profileUser={profileUser}/>
</Modal>

<Modal bind:this={writeMessageModal}>
	<WriteMessage itself={writeMessageModal} sendTo={destMsg}/>
</Modal>

<div class="vflex window friends">
	<h2>Friends</h2>
	<button class="update" on:click={() => {
		$client.socket.emit("getFriendList", { username: userInfo.username });
		$client.socket.emit("getAskList");
	}}>
		<img src="update.png" alt="update">
	</button>
	<div class="flex search-bar">
		<input class="bar" type="text" placeholder="Search for users" bind:value={searchUser}>
			{#if searchUser.length}
			<div class="result">
				{#if userSearchList.length}
				{#each userSearchList as user}
				<div class="flex line" on:click={() => {
					profileUser = user;
					userProfileModal.open();
					searchUser = "";
					userSearchList = [];
				}}>
					{#if user.img_url.includes("cdn.intra.42.fr")}
						<img src="{user.img_url}" alt="user">
					{:else}
						<img src="http://{location.hostname}:3000{user.img_url}" alt="user">
					{/if}
					<div class="user">{user.username}</div>
					<div class="status {(user.status == "online") ? "online" : (user.status == "in game") ? "playing" : ""}"></div>
				</div>
				{/each}
				{:else if searchUser.length && !userSearchList.length}
				<p>No result found</p>
				{/if}
			</div>
			{/if}
	</div>
	{#if !loadedFriends || !loadedRequests}
	<div class="vflex not-loaded">
		<div class="loading"></div>
		<p>Loading...</p>
	</div>
	{:else}
		{#if friendRequests && friendRequests.size}
		<div class="vflex requests">
			{#each [...friendRequests.values()] as request}
			<div class="flex line">
					{#if ((request.img) ? request.img : request.img_url).includes("cdn.intra.42.fr")}
						<img src={(request.img) ? request.img : request.img_url} alt="user" />
					{:else}
						<img src='http://{location.hostname}:3000{(request.img) ? request.img : request.img_url}' alt="user" />
					{/if}
				<div class="user" on:click={() => {
					$client.socket.emit("getFriendList", { username: userInfo.username });
					$client.socket.emit("getAskList");
				}}>
				<p>{request.username}</p>
				</div>
				<div class="flex buttons">
					<button on:click={() => {
						$client.socket.emit("acceptFriend", { username: request.username });
					}}>Accept</button>
					<button on:click={() => {
						$client.socket.emit("refuseFriend", { username: request.username });
					}}>Refuse</button>
				</div>
			</div> 
			{/each}
		</div>
		{/if}
		{#if friends && friends.size}
		<div class="vflex friends-list">
			{#each [...friends.values()] as friend}
			<div class="flex line">
				<div class="friend">{friend.username}</div>
				<div class="flex tools">
					<button on:click={() => {
						destMsg = [friend.username];
						writeMessageModal.open();
					}}><img src="/icon-mail.png" alt="mail"></button>
					<button on:click={() => {
						//TODO confirmMessage
						$client.socket.emit("removeFriend", { username: friend.username });
					}}>-</button>
				</div>
			</div>
			{/each}
		</div>
		{:else}
		<div class="no-friend">
			<p>You have no friends yet</p>
		</div>
		{/if}
	{/if}
	<CloseButton window={itself} />
</div>