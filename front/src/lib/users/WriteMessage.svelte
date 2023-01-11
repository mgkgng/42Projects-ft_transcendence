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
			p {
				height: 2.5em;
				padding: .8em 1em;
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
				padding: .5em .5em;
				right: .2em;
				bottom: .2em;
				border-radius: .3em;

				&:hover {
					background-color: transparentize(#fff, .6);
				}
			}
		}
	}
</style>

<script lang="ts">
    import { client } from "$lib/stores/client";
    import { onMount } from "svelte";
    import Modal from "$lib/tools/Modal.svelte";
	import AlertMessage from "$lib/modals/AlertMessage.svelte"

	export let itself: any;
	export let sendTo: Array<string>;

	let message: string = "";
	let errorMessage: string = "";
	let alertMessageModal: any;

	let searchUser: string = "";
	let userSearchList: Array<any> = [];
	$: searchUser = "";
	$: searchUser = searchUser.toLowerCase();
	$: { $client.socket.emit("getUserinDB", {username: searchUser}); }
	
	$: console.log(sendTo);

	onMount(() => {
		$client.socket.on("success_getUserinDB", (data: any) => {
			userSearchList = data.users.filter((user: any) => !sendTo.includes(user.username)); });
	
		$client.socket.on("success_sendDirectMessageG", (data: any) => {
			itself.close();
		});

		return (() => {
			$client.socket.off("success_getUserinDB");
			$client.socket.off("success_sendDirectMessageG");
		});
	});
</script>

<Modal bind:this={alertMessageModal}>
	<AlertMessage itself={alertMessageModal} msg={errorMessage} />
</Modal>

<div class="vflex window write">
	<div class="search">
		<input class="bar" type="text" placeholder="Search for users" bind:value={searchUser}>
		{#if searchUser.length}
			<div class="result">
				{#if userSearchList.length}
				{#each userSearchList as user}
				<div class="user" on:click={() => {
					if (sendTo.length < 5) {
						sendTo.push(user.username);
						sendTo = sendTo;
					} else {
						errorMessage = "You can write to maximum five people.";
						alertMessageModal.open();
					}
					searchUser = "";
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
				errorMessage = "Please put at least one destination."
				alertMessageModal.open();
				return ;
			} else if (!message.length) {
				errorMessage = "You cannot send an empty message!";
				alertMessageModal.open();
				return ;
			}
			for (let dest of sendTo)
				$client.socket.emit("sendDirectMessageG", {
					username: dest,
					message: message
				});
				message = "";
		}}>Send</button>
	</div>
</div>