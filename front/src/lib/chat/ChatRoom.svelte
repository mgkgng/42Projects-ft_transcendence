<style lang="scss">
	.room {
		width: 100%;
		height: 100%;
		gap: 0;

		.chat {
			width: 80%;
			height: 100%;
			gap: 0;
			
			align-items: center;
			border-right: $border;
			border-radius: 0 0 .8em 0;
			padding-left: .5em;
			
			.title {
				position: relative;
				width: 95%;
				height: 10%;
				border: $border;
				border-top: 0;
				border-radius: 0 0 .3em .3em;
				padding: 0 1em;
				gap: .2em;
				align-items: center;

				h1 { padding-bottom: .2em; }
				h3 { filter: brightness(50%); }
				
				button {
					width: 10%;
					height: 100%;
					position: absolute;
					top: 0;
					right: 0;
					padding: 0.3em;
					transition: .2s;

					img {
						width: 45px;
					}
					&:hover { background-color: transparentize(#fff, .6); }
				}
			}
			.read {
				height: 90%;
				width: 100%;
				overflow-y: scroll;
				scroll-behavior: auto;
				gap: 0;

				.line {
					width: 100%;
					position: relative;

					.content {
						min-width: 25%;
						word-wrap: break-word;
						max-width: 50%;
						padding: .3em .5em;
						background-color: $main-lowshade;
						border-radius: .4em;
						margin-top: .3em;
						margin-right: .5em;
						gap: 0;

						&:last-of-type {
							//TODO margin bottom for the last message
						}

						.info {
							height: 1.5em;
							position: relative;
							
							.username{
								cursor: pointer;
								text-decoration: underline;
								padding: 0 .3em;
								padding-bottom: .2em;
								border-radius: .4em;
								text-underline-offset: .1em;
								transition: .2s;

								&:hover {
									background-color: transparentize(#fff, .8);
								}
							}

							.date {
								position: absolute;
								right: 0;
								padding-top: .3em;
								font-size: 14px;
							}
						}

						.message { padding-left: .3em; }

					}

					

					.me {
						float: right;
						background-color: $submain-lowshadeblue;
						grid-column: 2;
					}
					.date {
						font-size: 12px;
					}
				}
			}
			.write {
				position: relative;
				width: 100%;
				height: 20%;
		
				textarea {
					padding-top: 2em;
					padding-left: 1em;
					padding-right: 1em;
					border-radius: .3em 0 .8em 0;
					white-space: pre-wrap;
		
					width: 100%;
					height: 100%;
					word-wrap: break-word;
					background-color: transparentize(#fff, .8	);
					border-top: $border-thin;
					border-left: $border-thin;
				}
		
				button {
					position: absolute;
					right: 0;
					bottom: 0;
					width: 3em;
					height: 2em;
					cursor: pointer;
					transition: .3s;
					border-radius: .2em 0 .8em 0;
		
					&:hover {
						background-color: transparentize(#fff, .7);
					}
				}
			}
		}

		.users {
			position: relative;
			width: 20%;
			gap: 0.2em;
			padding-top: 1.5em;

			.list {
				gap: 0;
				width: 90%;
				height: 100%;
				overflow-y: overlay;
				
				.user {
					cursor: pointer;
					width: 100%;
					padding: .5em .5em;
					transition: .1s;
					border-radius: 0 0 .5em 0;

					&:hover { background-color: transparentize(#fff, .7); }
				
					input {
						position: absolute;
						top: 0.8em;
						right: 0;
					}
				}
			}

			
			button {
				position: absolute;
				right: .2em;
				bottom: 0;
				border-radius: .2em .2em 0 0;
				img {
					width: 30px;
				}
				&:hover { background-color: transparentize(#fff, .6); }
			}
			.buttons-setting{
				display: grid;
				grid-template-columns: 1fr 1fr;
				.btn-gauche { grid-column-start: 1; grid-row: 1; width: 30px; left: 20px; bottom: 3px;}
				.btn-droite { grid-column-start: 2; grid-row: 1; }
			}
		}
		
	}

</style>

<script lang="ts">
    import ChatRoomSettings from "$lib/chat/ChatRoomSettings.svelte";
    import Modal from "$lib/tools/Modal.svelte";
    import { client } from "$lib/stores/client";
    import type { Chatt } from "$lib/chatt/Chatt";
    import UserProfile from "$lib/users/UserProfile.svelte";
    import ChatUserSettings from "$lib/chat/ChatUserSettings.svelte";
    import ChatAddUsers from "$lib/chat/ChatAddUsers.svelte";
    import { onMount } from "svelte";
	import { afterUpdate } from 'svelte';
	import {format_date_hours} from "$lib/stores/lib.ts"
    import { user} from "../stores/user.ts";
    import Layout from "../../routes/+layout.svelte";

	export let chat: Chatt;
	export let roomID: string;


	let chatRoomSettingsModal: any;
	let chatUsersSettingsModal: any;
	let chatAddUsers : any;
	let userProfileModal: any;

	let profileUser: any;
	let act_user : any = { username : ""};

	let newMessage: string = "";

	user.subscribe((value : any) => {
		act_user= value;
	});	

	onMount(() => {
		$client.socket.on("success_getUserinDB", (data: any) => {
			profileUser = data.users[0]; 
			console.log("succes_getUserinDB: ", profileUser, data)
		});
		chat.my_rooms.get(roomID).old_page = -1;
		scrollToBottom();
	});
	function scrollToBottom() {
		let chatBox : any = document.querySelector('.read');
		let sep: any = document.getElementById('separator-page');
		//if (chatBox)
		//{
			//chatBox.scrollTop = chatBox.scrollHeight;
		//}
		if (sep && (chat.my_rooms.get(roomID).actual_page != chat.my_rooms.get(roomID).old_page || chat.my_rooms.get(roomID).is_new_message))
		{
			if (chat.my_rooms.get(roomID).is_new_message)
			{
				chatBox.scrollTo({top: chatBox.scrollHeight,behavior: "smooth"});
				chat.my_rooms.get(roomID).actual_page = 0;
				chat.my_rooms.get(roomID).old_page = chat.my_rooms.get(roomID).actual_page;
			}
			else
				sep.scrollIntoView();
			chat.my_rooms.get(roomID).old_page = chat.my_rooms.get(roomID).actual_page;
			chat.my_rooms.get(roomID).is_new_message = false;
			chat = chat;
		}
			//chatBox.scrollTo({top: scrollHeight, behavior: 'auto'});
	}
	function sendMessageAndUpdate()
	{
		$client.socket.emit("new_message_room", {
			id_public_room: chat.my_rooms.get(roomID).roomID,
			content_message: newMessage
		});
		newMessage = "";
	}
	function handleScroll(event) {
		if (event.target.scrollTop === 0) {
			console.log("emit");
			$client.socket.emit("get_message_room_page", { id_public_room: roomID, page_number: ++chat.my_rooms.get(roomID).actual_page , size_page: 100});
		}
		else if(event.target.scrollTop === event.target.scrollHeight - event.target.clientHeight && chat.my_rooms.get(roomID).actual_page > 0)
		{
			chat.my_rooms.get(roomID).actual_page--;
			chat = chat;
		}
	}
	afterUpdate(() => {
		scrollToBottom();
	});
</script>

<Modal bind:this={chatRoomSettingsModal}>
	<ChatRoomSettings itself={chatRoomSettingsModal} bind:chat={chat} bind:roomId={roomID}/>
</Modal>

<Modal bind:this={chatAddUsers}>
	<ChatAddUsers itself={chatAddUsers} id_public_room={roomID} />
</Modal>

<Modal bind:this={chatUsersSettingsModal}>
	<ChatUserSettings itself={chatUsersSettingsModal} roomID={roomID} chat={chat}/>
</Modal>

<Modal bind:this={userProfileModal}>
	<UserProfile itself={userProfileModal} profileUser={profileUser}/> 
</Modal>

{#if chat}
<div class="flex room">
	<div class="vflex chat">
		<div class="flex title">
			<h1 class="name">{chat.my_rooms.get(roomID).title}</h1>
			<h3 class="id">#{chat.my_rooms.get(roomID).roomID}</h3>
			{#if chat.my_rooms.get(roomID).is_owner}
			<button on:click={() => { chatRoomSettingsModal.open(); }}>
				<img src="setting.png" alt="setting">
			</button>
			{/if}
		</div>
		<div class="vflex read"  on:scroll={handleScroll}>
		<!-- {#each chat.my_rooms.get(roomID).messages as message} -->
		<!-- {#each chat.my_rooms.get(roomID).messages.slice(chat.my_rooms.get(roomID).messages.length - 100  >= 1 ?  chat.my_rooms.get(roomID).messages.length - 100 : 0, chat.my_rooms.get(roomID).messages.length) as message} -->
		{#if  chat.my_rooms.get(roomID).pages_messages[chat.my_rooms.get(roomID).actual_page] != null}
			{#each chat.my_rooms.get(roomID).pages_messages[chat.my_rooms.get(roomID).actual_page] as message}
				<div class="line">
					<div class="vflex content {(act_user.username == message.username) ? "me" : ""}">
						<div class="flex info">
							<u class="username" on:click={() => {
								//TODO get profile User info
								profileUser = {};
								$client.socket.emit("getUserinDB", {username : message.username});
								userProfileModal.open();
								}}>{message.username}
							</u>
							<div class="date">{format_date_hours(message.date)}</div>
						</div>
						<div class="message">{message.message}</div>
					</div>
				</div>
			{/each}
			<div id="separator-page"></div>
			{#if  chat.my_rooms.get(roomID).actual_page > 0}
				{#each chat.my_rooms.get(roomID).pages_messages[chat.my_rooms.get(roomID).actual_page - 1] as message}
					<div class="line">
						<div class="vflex content {(act_user.username == message.username) ? "me" : ""}">
							<p on:click={() => {
							//TODO get profile User info
							profileUser = {};
							$client.socket.emit("getUserinDB", {username : message.username});
							userProfileModal.open();
						}}><u class="username">{message.username}:</u></p>
							<div>{message.message}</div>
							<div>{format_date_hours(message.date)}</div>
						</div>
					</div>
				{/each}
			{/if}
		{/if}
		</div>
		<div class="write">
			<textarea class="text-input" placeholder="write your message here..." bind:value={newMessage} on:keypress={(e) => {
				if (e.key == 'Enter')
					e.preventDefault();
			}}></textarea>
			<button on:click={() => {sendMessageAndUpdate()}}>Send</button>
		</div>
	</div>
	<div class="vflex users">
		<div class="vflex list">
			{#each chat.my_rooms.get(roomID).users as user}
			<div class="user" >
			<p on:click={() => {
				profileUser = {};
				$client.socket.emit("getUserinDB", {username : user.username});
				userProfileModal.open();
			}}>{user.username}</p>
			</div>
			{/each}
		</div>
		<div class="buttons-setting">
			{#if chat.my_rooms.get(roomID).is_admin}
			<button class="btn-droite" on:click={() => {
				chatUsersSettingsModal.open();
			}}>
				<img src="setting.png" alt="user-setting">
			</button><br/>
			{/if}
			{#if chat.my_rooms.get(roomID).is_admin && chat.my_rooms.get(roomID).is_private}
			<button class="btn-gauche" on:click={() => {
				chatAddUsers.open();
			}}>
				<img src="logo-test/add.svg" alt="add-user">
			</button>
		{/if}
		</div>
	</div>
</div>
{/if}

<svelte:window
	on:keydown={(e) => {
		if (e.key === 'Enter' && newMessage.length)
				sendMessageAndUpdate();
	}}
/>