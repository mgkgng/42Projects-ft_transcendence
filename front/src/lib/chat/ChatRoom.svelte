<style lang="scss">
	.read {
		overflow-y: scroll;
		padding: 2em;

		width: 100%;
		height: 70%;

	}
	.write {
		position: relative;
		width: 100%;
		height: 30%;


		input {
			padding-left: 1.5em;
			border-radius: .3em 0 .8em 0;

			width: 100%;
			height: 100%;
			background-color: transparentize(#fff, .8	);
			border-top: $border;
			border-left: $border;
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

	

	.users {
		width: 17%;
		gap: 0;

		p {
			padding: 1em;
			text-align: center;
			border-bottom: $border;
			background-color: transparentize($submain-blue, .3);
		}

		.list {
			padding: .8em .5em;
			gap: 0;
			.user {
				padding-left: .5em;
				height: 1.8em;
				cursor: pointer;
				transition: .1s;
				border-radius: .2em 0 .5em .2em;
				&:hover {
					background-color: transparentize(#fff, .7);
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

	export let chatRoom: ChattRoom;

	let chatRoomSettingsModal: any;

	let newMessage: string = "";

	// function sendMessage(){
	// 	$client.socket.emit("new_message_room", {room_name: actualName, content_message: newMessage});
	// }
	// function set_private_room()
	// {
	// 	$client.socket.emit("set_room_private", {room_name: $chatRoom.actualRoomName});
	// }
	// function unset_private_room()
	// {
	// 	$client.socket.emit("unset_room_private", {room_name: $chatRoom.actualRoomName});
	// }
	// function set_password_room()
	// {
	// 	let password = prompt("Enter the new passwod's room: ");
	// 	$client.socket.emit("set_password_room", {room_name: $chatRoom.actualRoomName, password: password});
	// }
	// function unset_password_room()
	// {
	// 	$client.socket.emit("unset_password_room", {room_name: actualName});
	// }
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
	<ChatRoomSettings itself={chatRoomSettingsModal} chatRoom={chatRoom}/>
</Modal>

<div class="read">
	{#if chatRoom.is_owner}
		<button>Settings</button>
	{/if}
	{#each chatRoom.messages as message}
		<!-- <ChatRoomMessage username={message.username} content_message={message.message} itself={ itself } axelUserProfileModal={axelUserProfileModal} is_admin={actualMessages.is_admin}/> -->
	{/each}
	</div>
	<div class="write">
		<input class="text-input" placeholder="write your message here..." bind:value={newMessage}>
		<!-- <button on:click={sendMessage}>send</button> -->
	</div>
	<div class="vflex users">
		<p>Online</p>
		<div class="vflex list">
			{#each chatRoom.usersRoom as actual_user}
			<div class="user">
				<div>{actual_user.username}</div>
				<!-- <input type="button" class="btn-room" value="mute" on:click={()=>muteUser(actual_user.username)}/>
				<input type="button" class="btn-room" value="ban" on:click={()=>banUser(actual_user.username)}/>
				<input type="button" class="btn-room" value="set Admin" on:click={()=>setAdmin(actual_user.username)}/> -->
			</div>
			{/each}
		</div>
	</div>