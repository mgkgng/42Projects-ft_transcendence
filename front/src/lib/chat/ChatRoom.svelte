<style lang="scss">
	.room {
		width: 100%;
		height: 100%;
		gap: 0;

		.chat {
			width: 80%;
			height: 100%;
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
				overflow-y: overlay;
				padding: 2em;
		
				width: 100%;
				height: 80%;
			}
			.write {
				position: relative;
				width: 100%;
				height: 20%;
		
				input {
					padding-left: 1.5em;
					border-radius: .3em 0 .8em 0;
		
					width: 100%;
					height: 100%;
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
			width: 20%;
			gap: 0.2em;
			padding-top: 1.5em;

			.list {
				gap: 0;
				width: 90%;
				height: 100%;
				overflow-y: overlay;
				
				.users {
					cursor: pointer;
					width: 100%;
					padding: .5em .5em;
					transition: .1s;
					border-radius: 0 0 .5em 0;

					&:hover { background-color: transparentize(#fff, .7); }
				}
			}
		}
	}

</style>

<script lang="ts">
    import ChatRoomMessage from "$lib/chat/ChatRoomMessages.svelte";
    import { ChattRoom } from "$lib/chatt/ChattRoom";
    import ChatRoomSettings from "$lib/chat/ChatRoomSettings.svelte";
    import Modal from "$lib/tools/Modal.svelte";
    import { client } from "$lib/stores/client";
	import { onMount } from "svelte";
    import { Message } from "$lib/chatt/Message";
    import { Chatt } from "$lib/chatt/Chatt";

	export let chat: Chatt;
	export let roomName: string;

	let chatRoomSettingsModal: any;

	let newMessage: string = "";

	// function banUser(username)
	// {
	// 	let date : any = prompt("Date: ")
	// 	let res : Date;
	// 	if (date)
	// 	{
	// 		res = new Date(date);
	// 		console.log(res);
	// 		if (isNaN(res.getTime()))
	// 			alert("Bad date");
	// 		else 
	// 			$client.socket.emit("ban_user", { room_name : $chatRoom.actualRoomName, username_ban: username, ban_end: res});
	// 	}
	// }
	// function setAdmin(username)
	// {
	// 	$client.socket.emit("set_admin", { room_name : $chatRoom.actualRoomName, username_new_admin: username});
	// }
	// function muteUser(username)
	// {
	// 	let date : any = prompt("Date: ")
	// 	let res : Date;
	// 	if (date)
	// 	{
	// 		res = new Date(date);
	// 		console.log(res);
	// 		if (isNaN(res.getTime()))
	// 			alert("Bad date");
	// 		else 
	// 			$client.socket.emit("mute_user", { room_name : $chatRoom.actualRoomName, username_ban: username, mute_end: res});
	// 	}
	// }
	// let files : any;
</script>

<Modal bind:this={chatRoomSettingsModal}>
	<ChatRoomSettings itself={chatRoomSettingsModal} chatRoom={chat.my_rooms.get(roomName)}/>
</Modal>

{#if chat}
<div class="flex room">
	<div class="vflex chat">
		<div class="title">
			<h1>{chat.my_rooms.get(roomName).room_name}</h1>
			{#if chat.my_rooms.get(roomName).is_owner}
			<button on:click={() => { chatRoomSettingsModal.open(); }}>
				<img src="setting.png" alt="setting">
			</button>
			{/if}
		</div>
		<div class="read">
		<!-- {#each chatRoom.messages as message} -->
			<!-- <ChatRoomMessages username={message.username} content_message={message.message} itself={ itself } axelUserProfileModal={axelUserProfileModal} is_admin={actualMessages.is_admin}/> -->
		<!-- {/each} -->
		</div>
		<div class="write">
			<input class="text-input" placeholder="write your message here..." bind:value={newMessage}>
			<button on:click={() => {
				$client.socket.emit("new_message_room", {
					room_name: chat.my_rooms.get(roomName).room_name,
					content_message: newMessage
				});
			}}>Send</button>
		</div>
	</div>
	<div class="vflex users">
		<div class="vflex list">
			{#each chat.my_rooms.get(roomName).users as user}
			<div class="users">
				<p>{user.username}</p>
				<!-- <input type="button" class="btn-room" value="mute" on:click={()=>muteUser(actual_user.username)}/>
				<input type="button" class="btn-room" value="ban" on:click={()=>banUser(actual_user.username)}/>
				<input type="button" class="btn-room" value="set Admin" on:click={()=>setAdmin(actual_user.username)}/> -->
			</div>
			{/each}
		</div>
	</div>
</div>
{/if}