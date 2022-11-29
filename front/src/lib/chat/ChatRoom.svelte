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

				.message {
					display: grid;
					grid-template-columns: 20% 70%;
				}
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
		}
	}

</style>

<script lang="ts">
    import ChatRoomSettings from "$lib/chat/ChatRoomSettings.svelte";
    import Modal from "$lib/tools/Modal.svelte";
    import { client } from "$lib/stores/client";
    import { Chatt } from "$lib/chatt/Chatt";
    import UserProfile from "$lib/users/UserProfile.svelte";
    import ChatUserSettings from "$lib/chat/ChatUserSettings.svelte";

	export let chat: Chatt;
	export let roomName: string;

	console.log(chat);

	let chatRoomSettingsModal: any;
	let chatUsersSettingsModal: any;
	let userProfileModal: any;

	let profileUser: any;

	let newMessage: string = "";

</script>

<Modal bind:this={chatRoomSettingsModal}>
	<ChatRoomSettings itself={chatRoomSettingsModal} chatRoom={chat.my_rooms.get(roomName)}/>
</Modal>

<Modal bind:this={chatUsersSettingsModal}>
	<ChatUserSettings itself={chatUsersSettingsModal} roomName={roomName} bind:chat={chat}/>
</Modal>

<Modal bind:this={userProfileModal}>
	<UserProfile itself={userProfileModal} profileUser={profileUser}/> 
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
		{#each chat.my_rooms.get(roomName).messages as message}
			<div class="message">
				<p>{message.username}:</p>
				<div>{message.message}</div>
				<div>{message.date}</div>
			</div>
		{/each}
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
			<div class="user" on:click={() => {
				//TODO get profile User info
			}}>
				<p>{user.username}</p>
			</div>
			{/each}
		</div>
		{#if chat.my_rooms.get(roomName).is_admin}
		<button on:click={() => {
			chatUsersSettingsModal.open();
		}}>
			<img src="setting.png" alt="user-setting">
		</button>
		{/if}
	</div>
</div>
{/if}