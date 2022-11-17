<style lang="scss">
	.friends {
		width: 360px;
		height: 480px;
		padding-bottom: .2em;
		padding-right: .5em;
		justify-content: space-between;
		gap: .2em;

		h2 {
			padding-bottom: .2em;
			width: 85%;
			border-bottom: $border-thin;
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
					}

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
					position: absolute;
					right: 2em;
					width: 7em;
					float: right;
					justify-content: flex-end;
					gap: 2em;

					padding: 1em;
					border-radius: 3em .2em .2em .2em;
					cursor: pointer;

					img {
						height: 1.2em;
					}

					button {
						cursor: pointer;
					}

					&:hover {
						background-color: transparentize($submain-lowshadeblue, .3);
						filter: saturate(50%);
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
    import Modal from "../tools/Modal.svelte";
    import UserProfile from "./UserProfile.svelte";

	export let itself: any;

	let friends: Array<any>
	let searchUser: string = "";
	let userSearchList: Array<any> = [];
	let userProfileModal: any;

	$: searchUser = "";
	$: searchUser = searchUser.toLowerCase();
	$: { $client.socket.emit("getUserinDB", {username: searchUser}); }

	onMount(() => {
		$client.socket.emit("getFriendList");

		$client.socket.on("error_getFriendList", (data: any) => {
			console.log("Error!");
		});

		$client.socket.on("success_getFriendList", (data: any) => {
			console.log(data);
		});

		$client.socket.on("success_getUserinDB", (data: any) => {
			console.log("success", data);
			userSearchList = data.users;
		});
	});
</script>

<Modal bind:this={userProfileModal}>
	<UserProfile />
</Modal>

<div class="vflex window friends">
	<h2>Friends</h2>
	<div class="search">
		<img src="/search.png" alt="search">
	</div>
	<div class="flex search-bar">
		<input class="bar" type="text" placeholder="Search for users" bind:value={searchUser}>
			{#if searchUser.length}
			<div class="result">
				{#if userSearchList.length}
				{#each userSearchList as user}
				<div class="flex line">
					<img src="{user.img_url}" alt="user">
					<div class="user" on:click={() => {
						$client.socket.emit("getUserProfile", { username: user.username });
					}}>{user.username}</div>
					<!-- <div class="status" style="background-color: {()}"></div> -->
				</div>
				{/each}
				{:else if searchUser.length && !userSearchList.length}
				<p>No result found</p>
				{/if}
			</div>
			{/if}
	</div>

	{#if friends}
	<div class="vflex friends-list">
		{#each friends as friend}
		<div class="flex line">
			<div class="friend">{friend.username}</div>
			<div class="flex tools">
				<button><img src="/icon-mail.png" alt="mail"></button>
				<button>-</button>
			</div>
		</div>
		{/each}
	</div>
	{:else}
	<div class="no-friend">
		<p>You have no friends yet</p>
	</div>
	{/if}
	<CloseButton window={itself} />
</div>