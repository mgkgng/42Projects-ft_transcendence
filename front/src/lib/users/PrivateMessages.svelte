<style lang="scss">
	.messages {
		width: 720px;
		height: 560px;
		padding: 0;

		.from {
			position: relative;
			width: 30%;
			height: 100%;
			border-right: $border;

			padding: 1.5em .5em;

			overflow-y: overlay;
			cursor: pointer;

			.line {
				width: 100%;
				height: 4em;
				border-bottom: $border-thin;
				align-items: center;
				transition: .2s;

				&:hover { background-color: transparentize(#fff, .6); }

				img {
					width: 45px;
					height: 45px;
					border-radius: 50%;
					margin-left: .5em;
					object-fit: cover;
				}
			}

			
		}

		.chat {
			width: 70%;
			height: 100%;
		}

		.no-selected {
			width: 70%;
			height: 100%;

			justify-content: center;
			align-items: center;
		}

		.no-users {
			width: 100%;
			height: 100%;

			justify-content: center;
			align-items: center;

			font-size: 24px;
		}

		.add {
			position: absolute;
			border-radius: .2rem;
			right: 0;
			bottom: 0;
			font-size: 56px;
			&:hover {
				background-color: transparentize(#fff, .6);
			}
		}
	}
</style>

<script lang="ts">
    import CloseButton from "$lib/items/CloseButton.svelte";
    import WriteMessage from "$lib/users/WriteMessage.svelte";
	import Modal from "$lib/tools/Modal.svelte";
	import { onMount } from "svelte";
    import { client } from "../stores/client";

	export let itself: any;

	let writeMessageModal: any;
	let allMessages: Map<string, any> = new Map<string, any>();

	let users: Array<any> = [{
		username: "min-kang",
		img: "pingu/pingu-angry.jpeg",
	}, {
		username: "hmm",
		img: "pingu/pingu-coucou.jpeg"
	}];

	let selected: string = "";

	onMount(() => {
		$client.socket.on("success_getMessageUserList", (data: any) => {
			console.log("list", data);
			for (let user of data.messageUserList) {
				$client.socket.emit("getDirectMessage", { username: user.username});
			}
		});
		
		$client.socket.on("success_getDirectMessage", (data: any) => {
			// let with = (data.messageHistory[0].recipient == usernamesomething) ? data.messageHistory[0].sender : data.messageHistory[0].recipient
			// allMessages.set(user.username, undefined);

		});

		$client.socket.emit("getMessageUserList");

		return (() => {
			$client.socket.off("success_getMessageUserList");
			$client.socket.off("success_getDirectMessage");
		});
	});
</script>

<Modal bind:this={writeMessageModal}>
	<WriteMessage itself={writeMessageModal} sendTo={[]}/>
</Modal>

<div class="flex window messages">
	{#if users.length}
		<div class="from">
			{#each users as user}
			<div class="flex line" on:click={() => { selected = user.username; }}>
				<img src="{user.img}" alt="from">
				<p>{user.username}</p>
			</div>
			{/each}
			<button class="add" on:click={() => { writeMessageModal.open(); }}>+</button>
		</div>
		{#if selected.length}
		<div class="chat">
		</div>
		{:else}
		<div class="flex no-selected">
			<p>Please select a message</p>
		</div>
		{/if}
	{:else}
		<div class="flex no-users">
			<p>You don't have any message yet.</p>
		</div>
		<button class="add" on:click={() => { writeMessageModal.open(); }}>+</button>
	{/if}
	<CloseButton window={itself} />
</div>