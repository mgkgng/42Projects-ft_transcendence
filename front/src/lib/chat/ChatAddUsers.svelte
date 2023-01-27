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
    import { client } from "$lib/stores/client";
    import { user } from "$lib/stores/user";
    import type { Chatt } from "$lib/chatt/Chatt";
    import { onMount } from "svelte";
    import CloseButton from "$lib/items/CloseButton.svelte";

	export let itself : any;
	export let id_public_room : any;

	let loadedFriends: boolean = false;

	let userInfo: any;
	user.subscribe((user: any) => { userInfo = user; });

	let friends: Map<string, any>;
	let searchUser: string = "";
	let userSearchList: Array<any> = [];
	let userProfileModal: any;
	let profileUser: any;

	$: searchUser = "";
	$: searchUser = searchUser.toLowerCase();
	$: { $client.socket.emit("getUserinDB", {username: searchUser}); }

	onMount(() => {
		$client.socket.on("success_getFriendList", (data : any) => {
			loadedFriends = false;
			friends = new Map<string, any>();
			for (let friend of data.friends)
				friends.set(friend.username, friend);
			friends = friends;
			loadedFriends = true;
		});

		$client.socket.emit("getFriendList");
	});

</script>

<div class="vflex window friends">
	<h2>Friends</h2>
	<button class="update" on:click={() => {
		$client.socket.emit("getFriendList", { username_42: userInfo.username_42 });
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
	{#if !loadedFriends }
	<div class="vflex not-loaded">
		<div class="loading"></div>
		<p>Loading...</p>
	</div>
	{:else}
		{#if friends && friends.size}
		<div class="vflex friends-list">
			{#each [...friends.values()] as friend}
			<div class="flex line">
				<div class="friend">{friend.username}</div>
				<div class="flex tools">
					<button on:click={() => {
						$client.socket.emit("append_user_to_room", {id_public_room: id_public_room, username : friend.username});
					}}><img src="logo-test/add.svg" alt="mail"></button>
				</div>
			</div>
			{/each}
		</div>
		{:else}
		<div class="no-friend">
			<p>You have no friends to add</p>
		</div>
		{/if}
	{/if}
	<CloseButton window={itself} />
</div>