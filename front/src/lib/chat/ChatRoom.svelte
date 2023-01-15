<style lang="scss">
	.room {
		width: 100%;
		height: 100%;
		gap: 0;

		.chat {
			width: 100%;
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
				display: grid;	
				grid-column: 1fr 1fr;
				grid-template-columns: 1fr; /* définit la largeur de chaque colonne à 1fr */
				grid-auto-rows: minmax(50px, auto);
				.line {
					padding: 1em 1em 1em 1em ;
					margin: 1em 1em 1em 1em;
					position: relative;
					grid-column: 1;
					min-height: 10%;
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
		.buttons{
			grid-column: 1fr 1fr;
			.btn-gauche { grid-column: 1;}
			.btn-droite { grid-column: 2;}
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
	import {format_date_hours} from "$lib/stores/lib.ts"
    import { user} from "../stores/user.ts";

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
		<div class="vflex read">
		{#each chat.my_rooms.get(roomID).messages as message}
			<div class="line">
				<div class="vflex content {(act_user.username == message.username) ? "me" : ""}">
					<p on:click={() => {
					//TODO get profile User info
					profileUser = {};
					$client.socket.emit("getUserinDB", {username : message.username});
					userProfileModal.open();
				}}><u>{message.username}:</u></p>
					<div>{message.message}</div>
					<div>{format_date_hours(message.date)}</div>
				</div>
			</div>
		{/each}
		</div>
		<div class="write">
			<input class="text-input" placeholder="write your message here..." bind:value={newMessage}>
			<button on:click={() => {
				$client.socket.emit("new_message_room", {
					id_public_room: chat.my_rooms.get(roomID).roomID,
					content_message: newMessage
				});
				newMessage = "";
			}}>Send</button>
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
		<div class="buttons">
			{#if chat.my_rooms.get(roomID).is_admin}
			<button class="btn-gauche" on:click={() => {
				chatUsersSettingsModal.open();
			}}>
				<img src="setting.png" alt="user-setting">
			</button><br/>
			{/if}
			{#if chat.my_rooms.get(roomID).is_admin && chat.my_rooms.get(roomID).is_private}
			<br/><button class="btn-gauche" on:click={() => {
				chatAddUsers.open();
			}}>
				<img src="logo-test/add.svg" alt="add-user">
			</button>
		{/if}
		</div>
	</div>
</div>
{/if}