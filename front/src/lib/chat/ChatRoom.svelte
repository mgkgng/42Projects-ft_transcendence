<style lang="scss">
	.chat {
		width: 960px;
		height: 640px;
		padding: 0;
		gap: 0;
	}

	.rooms {
		width: 23%;
		padding: 0;
		margin: 0;

		.tools {
			width: 100%;
			height: 7%;
			gap: .2em;
			padding-left: 1em;
			padding-top: 0;

			button {
				width: 5em;
				height: 2em;
				border-radius: 0 0 .2em .2em;
				// padding-top: .1em;
				background-color: transparentize(#fff, .6);
				cursor: pointer;
				transition: .3s;

				&:nth-child(1) { background-color: $main-bright; }
				&:nth-child(2) { background-color: $submain-lowshadeblue; }
			}
		}

		.list {
			border-top: $border;
			border-right: $border;
			border-radius: 0 1em 0 0;
			padding-right: .5em;
			height: 93%;
			gap: 0.1em;

			p {
				text-align: center;
				font-size: 25px;
				margin: .5em;
			}
			
			.line {
				position: relative;
				align-items: center;
				height: 3em;

				.room {
					width: 80%;
					height: 100%;
					cursor: pointer;
					border-radius: 0 0em 2em 0;
					z-index: 2;
					background-color: #212121;
					transition: .3s;
					padding: 1em;
					border: $border-thin;
					border-left: none;
				}

				.choose{
					background-color: rgba(207, 196, 196, 0.5);
					text-decoration: underline;
				}

				&:hover {
					.room {
						background-color: rgb(94, 94, 94);
						width: 83%;
					}
					.button {
						background-color: $main-bright;
						right: 9%;
					}
				}

				.button {
					z-index: 1;
					position: absolute;
					right: 15%;
					width: 35%;
					height: 100%;
					border: $border-thin;
					border-radius: 0 .2em .2em 0;
					background-color: transparentize(#fff, .7);
					cursor: pointer;
					transition: .3s;

					p {
						position: absolute;
						right: 0.2em;
						bottom: 0.2em;
						font-size: 15px;
						opacity: 0;
						transition: .3s;
					}

					&:hover {
						right: 0;
						p { opacity: .5; }
					}
				}
			}

			.no-room {
				height: 100%;
				font-size: 15px;
				justify-content: center;
				padding-top: 30%;
			}
		}
	}

	.chatroom {
		width: 77%;

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

		.no-select {
			width: 100%;
			height: 100%;
			justify-content: center;
			align-items: center;
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
	// export let userInfo;
	import Modal from "$lib/tools/Modal.svelte";
    import { client } from "$lib/stores/client";
    // import { chatRoom, ChatRooms, Room } from "$lib/stores/chatRoom";
	import { onMount, afterUpdate } from "svelte";
    import ChatRoomMessage from "$lib/tools/chatRoomMessage.svelte";
    import AddRoom from "$lib/chat/AddRoom.svelte";
    import { Chat } from "$lib/chatt/Chat";
    import SearchRoom from "$lib/chat/SearchRoom.svelte";
	import { ChatRoom } from "$lib/chatt/ChatRoom";
    import CloseButton from "$lib/items/CloseButton.svelte";
    import RoomPassword from "./RoomPassword.svelte";

	let chat: Chat = new Chat();
	export let itself: any; 

	let newMessage : string;

	let roomSelected: string = "";
	
	let addRoomModal: any;
	let searchRoomModal: any;
 
	//afterUpdate(() => {
			//message_zone.scroll({top: 1000000000});
	//});
	//$: if(actualMessages && message_zone)
	//	{
	//		message_zone.scroll({top: 1000000000});
	//	}

	onMount (() => {
		/* Chat Updates*/
		$client.socket.on("set_room_not_visible_res", (data: any) => {
			chat.my_rooms.delete(data);
			chat = chat;
		});

		$client.socket.on("set_room_visible", (data: any) => { client.socket.emit("get_my_rooms"); });
		$client.socket.on("set_room_private", (data: any) => { chat.my_rooms.get(data.room_name).is_private = true; });
		$client.socket.on("unset_room_private", (data: any) => { chat.my_rooms.get(data.room_name).is_private = false; });
		$client.socket.on("set_password_room", (data: any) => { chat.my_rooms.get(data.room_name).is_password_protected = true; });
		$client.socket.on("unset_password_room", (data: any) => { chat.my_rooms.get(data.room_name).is_password_protected = false; });

		$client.socket.on("get_all_rooms_res", (data : any) => {
			for (let room of data)
				chat.rooms.set(room.name, room.is_password_protected);
			chat = chat;
		});
		$client.socket.on("get_my_rooms_res", (data: any) => {
			for (let x of data)
				chat.my_rooms.set(x.room.name, new ChatRoom(x.room.name, x.room.is_password_protected, x.room.is_private, x.is_admin, x.is_owner));
			chat = chat;
		});

		$client.socket.on("new_room_res", (data : any) => {
			console.log("something received");
			chat.rooms.set(data.room_name, new ChatRoom(data.room_name, data.is_password_protected, data.is_private, data.is_admin, true))
			chat.my_rooms.push(data.room_name);
			chat = chat;
		});

		$client.socket.emit("get_my_rooms");
		$client.socket.emit("get_all_rooms");

		return(() => {
			$client.socket.off("get_my_rooms_res");
			$client.socket.off("get_all_rooms_res");
			$client.socket.off("set_room_not_visible_res");
			$client.socket.off("set_room_visible");
			$client.socket.off("set_room_private");
			$client.socket.off("unset_room_private");
			$client.socket.off("set_password_room");
			$client.socket.off("unset_password_room");
			$client.socket.off("new_room_res");
		});
	});
	
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

<Modal bind:this={addRoomModal}>
	<AddRoom itself={addRoomModal} />
</Modal>

<Modal bind:this={searchRoomModal}>
	<SearchRoom itself={searchRoomModal} chat={chat}/>
</Modal>

<div class="flex window chat">
	<div class="rooms">
		<div class="flex tools">
			<button on:click={() => { addRoomModal.open(); }}>Add</button>
			<button on:click={() => { searchRoomModal.open(); }}>Join</button>
		</div>
		<div class="vflex list">
			<p>My Rooms</p>
			{#if chat?.my_rooms.size}
			{#each (chat.sortRoomsKeys([...chat.my_rooms.keys()])) as room}
			<div class="flex line">
				<div class="room {(room == roomSelected) ? "chosen" : ""}" on:click={() => {
					roomSelected = room;
				}}>{room}</div>
				<div class="button" on:click={() => {
					$client.socket.emit("set_room_not_visible", { room_name: room });
				}}><p>Quit</p></div>
			</div>
			{/each}
			{:else}
			<div class="flex no-room">You didn't join any room yet</div>
			{/if}
		</div>
	</div>
	<div class="vflex chatroom">
		{#if (roomSelected.length)}
			<div class="read">
			{#if chat.my_rooms.get(roomSelected).is_owner}
				<!-- {#if chat.my_rooms.get(roomSelected).is_owner.is_private}
					<input class="button" value="Set private" on:click={unset_private_room}>
				{:else}
					<input class="button" value="Set private" on:click={set_private_room}>
				{/if}
				{#if chat.my_rooms.get(roomSelected).is_owner.is_password_protected}
					<input class="button" value="delete password" on:click={unset_password_room}>
					<input class="button" value="Change password" on:click={set_password_room}>
				{:else}
					<input class="button" value="add password" on:click={set_password_room}>
				{/if} -->
			{/if}
			{#each chat.my_rooms.get(roomSelected)?.messages as message}
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
					{#each chat.my_rooms.get(roomSelected)?.usersRoom as actual_user}
					<div class="user">
						<div>{actual_user.username}</div>
						<!-- <input type="button" class="btn-room" value="mute" on:click={()=>muteUser(actual_user.username)}/>
						<input type="button" class="btn-room" value="ban" on:click={()=>banUser(actual_user.username)}/>
						<input type="button" class="btn-room" value="set Admin" on:click={()=>setAdmin(actual_user.username)}/> -->
					</div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="flex no-select">
				<h2>Please select a room</h2> 
			</div>
		{/if}
	</div>
	<CloseButton window={itself}/>
</div>

