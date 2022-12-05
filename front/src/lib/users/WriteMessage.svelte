<style lang="scss">
	.write {
		width: 640px;
		height: 320px;
		border: $border;
		border-radius: .3em;
		padding: 2em 2em;
		gap: .5em;

		.search {
			position: relative;

			.bar {
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
				background-color: $grey;
				border-radius: .1em;
				z-index: 33;

				.user {
					padding: .5em .6em;
					gap: .4em;
					cursor: pointer;
					align-items: center;

				}
			}
		}
		.send-to {
			width: 100%;
			border-radius: .3em;

			.dist {

				.to {
					align-items: center;
					gap: .5em;
					padding: .2em .5em;
					background-color: $submain-lowshadeblue;
					border-radius: .3em;
				}
			}
		}
		.content {
			width: 100%;
			height: 75%;
			position: relative;
			border: $border-thin;
			border-radius: .3em;

			input {
				width: 100%;
				height: 100%;
				padding: 1em .6em;
			}
			button {
				position: absolute;
				right: 0;
				bottom: 0;
			}
		}
	}
</style>

<script lang="ts">
    import { client } from "$lib/stores/client";
    import { onMount } from "svelte";

	export let itself: any;
	export let sendTo: Array<string>;

	let message: string = "";
	let errorMessage: string = "";

	let searchUser: string = "";
	let userSearchList: Array<any> = [];
	$: searchUser = "";
	$: searchUser = searchUser.toLowerCase();
	$: { $client.socket.emit("getUserinDB", {username: searchUser}); }
	
	$: console.log(sendTo);

	onMount(() => {
		$client.socket.on("success_getUserinDB", (data: any) => {
			userSearchList = data.users.filter((user: any) => !sendTo.includes(user.username)); });
	});
</script>

<div class="vflex window write">
	<div class="search">
		{#if searchUser.length}
			<div class="result">
				{#if userSearchList.length}
				{#each userSearchList as user}
				<div class="user" on:click={() => {
					sendTo.push(user.username);
					sendTo = sendTo;
				}}>
					{user.username}
				</div>
				{/each}
				{:else if searchUser.length && !userSearchList.length}
				<p>No result found</p>
				{/if}
			</div>
			{/if}
	</div>
	<input class="bar" type="text" placeholder="Search for users" bind:value={searchUser}>
	<div class="vflex send-to">
		<div class="flex dist">
			{#each sendTo as user}
			<div class="flex to">
				<p>{user}</p>
				<button on:click={() => {
					sendTo.splice(sendTo.indexOf(user), 1);
					sendTo = sendTo;
				}}>x</button>
			</div>
			{/each}
		</div>
	</div>
	<div class="content">
		<input type="text" placeholder="Write your message here..." bind:value={message}>
		<button on:click={() => {
			if (!sendTo.length) {
				errorMessage = "Please put anybody to whom you want to send a message."
				return ;
			} else if (!message.length) {
				errorMessage = "You cannot send an empty message!";
				return ;
			}
			for (let dest of sendTo)
				$client.socket.emit("sendDirectMessage", {
					username: dest,
					message: message
				});
		}}>Send</button>
	</div>
</div>