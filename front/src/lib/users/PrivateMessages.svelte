<style lang="scss">
	.messages {
		width: 720px;
		height: 560px;
		display: flex;
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
			width: 80%;
			height: 100%;
			gap: 0;
			.read {
				height: 90%;
				overflow-y: scroll;
				
				.line {
					width: 100%;
					position: relative;
					.content {
						width: max-content;
						max-width: 20em;
						padding: .3em .5em;
						background-color: rgb(75, 75, 75);
						border-radius: .4em;
					}
					.me {
						// float: right;
						position: absolute;
						right: 0;
						background-color: blue;
					}
					.date {
						font-size: 12px;
					}
				}
			}
			.write{
				width: 100%;
				height: 10%;
				padding:0;
				display: flex;
				flex-direction: row;
				align-items: center;
			input[type="text"]{
				width: 80%;
			}
			button{
				width: 20%;
			}
		}
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
	import { format_date_hours } from "$lib/stores/lib";
	import { onMount } from "svelte";
    import { client } from "$lib/stores/client";
    import { user } from "$lib/stores/user";
	import { afterUpdate } from 'svelte';

	export let itself: any;

	let writeMessageModal: any;
	let exchanges: Map<string, any> = new Map<string, any>();
	let allMessages: Map<string, any> = new Map<string, any>();

	let selected: string = "";

	let userInfo: any;
	user.subscribe((user: any) => { userInfo = user; });

	onMount(() => {
		$client.socket.on("success_getMessageUserList", (data: any) => {
			for (let user of data.messageUserList) {
				exchanges.set(user.username, user);
				exchanges = exchanges;
			}
		});
		
		$client.socket.on("success_getDirectMessage", (data: any) => {
			let from = (data.messageHistory[0].recipient == userInfo.username) ? data.messageHistory[0].sender : data.messageHistory[0].recipient
			// if allMessage from user is not defined, create it otherwise append the message received
			if (!allMessages.has(from)) {
				allMessages.set(from, data.messageHistory);
			} else {
				allMessages.set(from, allMessages.get(from).concat(data.messageHistory));
			}
			allMessages = allMessages;
		});

		$client.socket.on("success_sendDirectMessageG", (data: any) => {
			console.log("success_sendDirectMessageG", data);
			$client.socket.emit("getDirectMessage", { username: user.username, limit: 1, offset: allMessages.get(selected).length});
		});

		$client.socket.on("error_getDirectMessage", (data: any) => {
			console.log("error", data);
		});

		$client.socket.on("newMessageArrived", async (senderUsername: string) => {
			if (selected == senderUsername) {
				$client.socket.emit("getDirectMessage", { username: user.username, limit: 9999, offset: 0});
			}
			// refresh the message list
			$client.socket.emit("getMessageUserList");
		});

		$client.socket.emit("getMessageUserList");

		return (() => {
			$client.socket.off("success_getMessageUserList");
			$client.socket.off("success_getDirectMessage");
			$client.socket.off("success_sendDirectMessageG");
		});
	});

	afterUpdate(() => {
		scrollToBottom();
	});


	function getMessageAndChangeSelected(selected_username: string)
	{
		selected = selected_username;
		$client.socket.emit("getDirectMessage", { username: selected, limit: 9999, offset: 0});
	}

	let message = '';

	async function sendDirectMessageAndUpdate() {
		$client.socket.emit('sendDirectMessageG', {username: selected, message: message});
		message = '';
	}

	function scrollToBottom() {
		let chatBox = document.querySelector('.read');
		if (chatBox)
		{
			chatBox.scrollTop = chatBox.scrollHeight;
		}
	}
</script>

<Modal bind:this={writeMessageModal}>
	<WriteMessage itself={writeMessageModal} sendTo={[]}/>
</Modal>

<div class="flex window messages">
	{#if exchanges.size}
		<div class="from">
			{#each [...exchanges.values()] as user}
			<div class="flex line" on:click={() => {getMessageAndChangeSelected(user.username)}}>
				<img src="{(user.img) ? user.img : user.img_url}" alt="from">
				<p>{user.username}</p>
			</div>
			{/each}
			<button class="add" on:click={() => {writeMessageModal.open(); }}>+</button>
		</div>
		{#if allMessages.has(selected)}
		<div class="vflex chat">
			<div class="vflex read">
				{#each allMessages.get(selected) as message}
				<div class="line">
					<p class="content {(userInfo.username == message.sender) ? "me" : ""}">
						{message.message}
					</p>
					<div class="date">{format_date_hours(message.date)}</div>
				</div>
				{/each}
			</div>
			<div class="write">
				<input type="text" bind:value={message} placeholder="Type your message here" class="messageInput" on:keydown={event => {if (event.key === 'Enter') sendDirectMessageAndUpdate()} } />
				<button on:click={sendDirectMessageAndUpdate} class="sendButton">Send</button>
			</div>
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