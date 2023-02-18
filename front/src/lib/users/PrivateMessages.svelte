<style lang="scss">
	.messages {
		position: relative;

		width: 720px;
		height: 560px;
		display: flex;
		padding: 0;
		gap: 0;

		.from {
			width: 30%;
			max-height: 100%;
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
			.add {
				position: absolute;
				left: 0;
			}
		}
		.chat {
			width: 70%;
			height: 100%;
			gap: 0;

			.read {
				position: relative;
				height: 90%;
				width: 100%;
				overflow-y: overlay;
				gap: 0;

				.load-more {
					position: absolute;
					top: 0;
					left: 20%;
					justify-content: center;
					width: 60%;
					height: 2em;
					transition: .3s;
					border-radius: 0 0 .5em .5em;
					&:hover {
						background-color: transparentize(#fff, .8);
					}
				}
				.line {
					width: 100%;
					&:first-child {
						margin-top: 2em;
					}
					gap: 0;
					.content {
						position: relative;
						word-wrap: break-word;
						min-width: 15%;
						max-width: 50%;
						padding: .3em .5em;
						background-color: $main-lowshade;
						border-radius: .4em;
						margin-bottom: .2em;
						margin-left: .4em;
						margin-right: .4em;
						float: left;

						.invitation {
							width: 100%;
							gap: .2em;

							.invite-from {
								width: 100%;
								padding-right: 2.5em;
							}
							.invitation-msg {
								max-width: 100%;
								border-radius: .5em;
								margin-top: .2em;
								background-color: transparentize(#fff, .6);
								padding: .6em .4em;
							}
							button {
								height: 2em;
								&:hover {
									background-color: transparentize(#fff, .8);
									border-radius: .3em;
								}
							}
						}
						.message {
							min-height: 1em;
							padding-right: 2.5em;
							letter-spacing: .5px;
						}
						.date {
							position: absolute;
							right: .5em;
							top: .7em;
							font-size: 12px;
						}
					}
					.me {
						float: right;
						background-color: $submain-lowshadeblue;
						grid-column: 2;
					}
				}
			}
			.write {
				position: relative;
				width: 100%;
				height: 10%;
				padding:0;
				display: flex;
				flex-direction: row;
				align-items: center;
				input {
					width: 85%;
					height: 100%;
					padding-left: .8em;
					padding-right: .5em;
					transition: .2s;
					&:hover, &:focus-within {
						background-color: transparentize(#fff, .8);
					}
				}
				button {
					position: absolute;
					width: 15%;
					height: 100%;
					right: 0;
					// border-radius: .3em;
					transition: .2s;
					&:hover { background-color: transparentize(#fff, .9); }
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
			justify-content: center;
			align-items: center;
			width: 2rem;
			height: 2rem;
			right: 0;
			bottom: 0;
			font-size: 36px;
			transition: .3s;
			padding-bottom: .2aem;
			&:hover {
				background-color: transparentize(#fff, .5);
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
	import { onDestroy } from "svelte";
    import { client } from "$lib/stores/client";
    import { user } from "$lib/stores/user";
	import { afterUpdate } from 'svelte';
	import { beforeUpdate } from 'svelte';
    import ChatRoom from "../chat/ChatRoom.svelte";
    import Chat from "../chat/Chat.svelte";
    import Invitation from "./Invitation.svelte";
	export let itself: any;
	let writeMessageModal: any;
	let invitationModal: any;
	let exchanges: Map<string, any> = new Map<string, any>();
	let allMessages: Map<string, any> = new Map<string, any>();
	let allMessagePage: number = 1;
	let allMessagePageSize: number = 20;
	let renderButtonToGetMoreMessages = true;
	let getDirectMessage = true;
	let selectMessageOrBlocked : string = "Please select a message";
	let selected: string = "";
	let userInfo: any;
	let roomID: string = "";
	let message = '';
	user.subscribe((user: any) => { userInfo = user; });
	
	onMount(() => {
		$client.socket.on("success_getMessageUserList", (data: any) => {
			for (let user of data.messageUserList) {
				exchanges.set(user.username_42, user);
				exchanges = exchanges;
			}
		});
		
		$client.socket.on("success_getDirectMessage", (data: any) => {
			if (data.messageHistory.length < 20)
			{
				renderButtonToGetMoreMessages = false;
			}
			let from = (data.messageHistory[0].recipient == userInfo.username_42) ? data.messageHistory[0].sender : data.messageHistory[0].recipient
			// if allMessage from user is not defined, create it otherwise append the message received
			if (!allMessages.has(from)) {
				allMessages.set(from, data.messageHistory);
			} else {
				// before concat verify that the id of the message is not already in the array
				let oldMessages = allMessages.get(from);
				let newMessages = data.messageHistory;
				// for each new message, check if it is already in the old messages
				for (let newMessage of newMessages) {
					let found = false;
					for (let oldMessage of oldMessages) {
						if (oldMessage.id == newMessage.id) {
							found = true;
							break;
						}
					}
					if (!found) {
						oldMessages.push(newMessage);
						oldMessages.sort((a: any, b: any) => {
							return a.id - b.id;
						});
					}
				}
				allMessages.set(from, oldMessages);
			}
			allMessages = allMessages;
			selectMessageOrBlocked = "Please select a message";
		});
		// this will append when you send a message (sendDirectMessageG)
		$client.socket.on("getDirectMessage", (lastMessage: any) => {
	
			let from = (lastMessage.recipient == userInfo.username_42) ? lastMessage.sender : lastMessage.recipient
			let oldMessage = allMessages.get(from);
			let found = false;
			for (let message of oldMessage) {
				if (message.id == lastMessage.id) {
					found = true;
					break;
				}
			}
			if (found == false)
			{
				oldMessage.push(lastMessage);
				allMessages.set(from, oldMessage);
				allMessages = allMessages;
				getDirectMessage = true;
			}
			// console.log("getDirectMessage", lastMessage)
			allMessages = allMessages;

		});
		$client.socket.on("error_getDirectMessage", (data: any) => {
			// console.log("error", data);
			selectMessageOrBlocked = data.error;
		});
		$client.socket.on("success_sendDirectMessageG", (data: any) => {
			// console.log("success_sendDirectMessageG", data);
			writeMessageModal.close();
			if (data.message.startsWith('/gameInvitation/')) {
				roomID = data.message.split('/')[2];
				invitationModal.open();
			}
			$client.socket.emit("getDirectMessage", )
		});
		$client.socket.on("error_sendDirectMessageG", (data: any) => {
			// console.log("error_sendDirectMessageG", data);
		});
		$client.socket.on("newMessageArrived", async (senderUsername: string) => {
			if (selected == senderUsername) {
				$client.socket.emit("getDirectMessage", { username_42: user.username_42, page: allMessagePage, pageSize: allMessagePageSize});
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
		if (getDirectMessage)
		{
			scrollToBottom();
		}
		else
		{
			// const separator = document.querySelector('.separator');
			// if (separator)
			// 	separator.parentNode.scrollTop = separator.offsetTop;
			document.querySelector(".separator")?.scrollIntoView(true);
		}
	});
	function getMessageAndChangeSelected(selected_username_42: string)
	{
		selected = selected_username_42;
		// console.log("sending", selected_username_42);
		$client.socket.emit("getDirectMessage", { username_42: selected_username_42, page: allMessagePage, pageSize: allMessagePageSize});
	}
	function sendDirectMessageAndUpdate() {
		if (!message.length)
			return ;
		// console.log("sendDirectMessageG", {username_42: selected, message: message})
		$client.socket.emit('sendDirectMessageG', {username_42: selected, message: message});
		message = '';
	}
    let handleLoadMoreMessage = () => {
        $client.socket.emit("getDirectMessage", { username_42: selected, page: ++allMessagePage, pageSize: allMessagePageSize});
    }
	function scrollToBottom() {
		let messages = document.querySelector(".read");
		if (messages)
		{
			messages.scrollTop = messages.scrollHeight;
			getDirectMessage = false;
		}
	}
	$: allMessages = allMessages;
</script>
<Modal bind:this={writeMessageModal}>
	<WriteMessage itself={writeMessageModal} sendTo={[]}/>
</Modal>
<Modal bind:this={invitationModal}>
	<Invitation itself={invitationModal} roomID={roomID}/>
</Modal>
<div class="flex window messages">
	{#if exchanges.size}
		<div class="from">
			{#each [...exchanges.values()] as user}
			<div class="flex line" on:click={() => {getMessageAndChangeSelected(user.username_42)}}>
				{#if ((user.img) ? user.img : user.img_url).includes("cdn.intra.42.fr")}
					<img src="{(user.img) ? user.img : user.img_url}" alt="from">
				{:else}
					<img src="http://{location.hostname}:3000{(user.img) ? user.img : user.img_url}" alt="from">
				{/if}
				<p>{user.username}</p>
			</div>
			{/each}
			<button class="flex add" on:click={() => {writeMessageModal.open(); }}>+</button>
		</div>
		{#if allMessages.has(selected)}
		<div class="vflex chat">
			<div class="vflex read">
				{#each allMessages.get(selected) as message, i}
				<div class="line">
					<div class="content {(userInfo.username_42 == message.sender) ? "me" : ""}">
						{#if !message.message.startsWith('/gameInvitation/')}
						<div class="message">{message.message}</div>
						{:else}
						<div class="vflex invitation">
							<div class="invite-from">{message.sender} is inviting to play a game!</div>
							<div class="invitation-msg">{message.message.split('/')[3].replaceAll('&sl', '/')}</div>
							<button on:click={() => {
								$client.socket.emit("JoinRoom", {
									roomID: message.message.split('/')[2],
									play: true
								});
							}}>Join</button>
						</div>
						{/if}
						<div class="invitation"></div>
						<div class="date">{format_date_hours(message.date)}</div>
					</div>
				</div>
				{#if i % 19 == 0 && i != 0 && renderButtonToGetMoreMessages}
					<div class="separator"></div>
				{/if}
				{/each}
				{#if renderButtonToGetMoreMessages}
				<div class="flex load-more">
					<button on:click={handleLoadMoreMessage}>Load more message</button>
				</div>
				{/if}
			</div>
			<div class="write">
				<input type="text" bind:value={message} placeholder="Type your message here" class="messageInput" on:keydown={event => {if (event.key === 'Enter') sendDirectMessageAndUpdate()} } />
				<button on:click={sendDirectMessageAndUpdate} class="sendButton">Send</button>
			</div>
		</div>
		{:else}
		<div class="flex no-selected">
			<p>{selectMessageOrBlocked}</p>
		</div>
		{/if}
	{:else}
		<div class="flex no-users">
			<p>You don't have any message yet.</p>
		</div>
		<button class="flex add" on:click={() => { writeMessageModal.open(); }}>+</button>
	{/if}
	<CloseButton window={itself} />
</div>
