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
			height: 10%;
			gap: .2em;
			padding: .2em;
			padding-top: 0;

			button {
				width: 5em;
				height: 2em;
				border-radius: 0 0 .2em .2em;
				// padding-top: .1em;
				background-color: transparentize(#fff, .6);
				cursor: pointer;
				transition: .3s;

				&:nth-child(1):hover { background-color: $main-bright; }
				&:nth-child(2):hover { background-color: $submain-lowshadeblue; }
			}
		}

		.list {
			padding-right: .5em;
			gap: 0.1em;
			p {
				padding-left: .5em;
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
		}
	}

	.chatroom {
		width: 60%;
		border-right: $border;

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
			padding-left: 4em;
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
    import { chatRoom, ChatRooms, Room } from "$lib/stores/chatRoom";
	import { onMount, afterUpdate } from "svelte";
    import ChatRoomMessage from "$lib/tools/chatRoomMessage.svelte";
    import AddRoom from "$lib/chat/AddRoom.svelte";
    import AllChatRooms from "$lib/chat/AllChatRooms.svelte";

	export let itself: any; 
	// export let axelUserProfileModal : any;
	// export let allChatModal: any;

	let newMessage : string;

	let rooms : string[]; //Rooms visibles par le user
	let actualName: string; //Name de la room selectionnee
	let actualMessages : Room = new Room("", false, false, false, false);
	
	let addRoomModal: any;
	let allChatRoomModal: any;

	//afterUpdate(() => {
			//message_zone.scroll({top: 1000000000});
	//});
	//$: if(actualMessages && message_zone)
	//	{
	//		message_zone.scroll({top: 1000000000});
	//	}

	//Liens entre les variables de ce fichier et les variables dans le stores "/src/stores/chatRoom.ts"
	chatRoom.subscribe(chat  => { actualMessages = chat.actualRoom;});
	chatRoom.subscribe(chat => { actualName = chat.actualRoomName;});
	chatRoom.subscribe(chat => { rooms = chat.rooms;});
	chatRoom.subscribe(chat => { actualName = chat.actualRoomName;});
	onMount (() => {
		$client.socket.on("set_room_private", (data) =>
		{
			chatRoom.update((chat) =>{
				chat.messages.get(data.room_name).is_private = true;
				return (chat);
			})
		});
		$client.socket.on("unset_room_private", (data) =>
		{
			chatRoom.update((chat) =>{
				chat.messages.get(data.room_name).is_private = false;
				return (chat);
			})
		});
		$client.socket.on("set_password_room", (data) =>
		{
			chatRoom.update((chat) =>{
				chat.messages.get(data.room_name).is_password_protected = true;
				return (chat);
			})
		});
		$client.socket.on("unset_password_room", (data) =>
		{
			chatRoom.update((chat) =>{
				chat.messages.get(data.room_name).is_password_protected = false;
				return (chat);
			})
		});

		
	});
	function  chooseRoom(room : any){
		chatRoom.update(chat => { 
			chat.actualRoom = chat.messages.get(room.room);
			chat.actualRoomName = room.room;
			return (chat);
		});
	}
	function sendMessage(){
		$client.socket.emit("new_message_room", {room_name: actualName, content_message: newMessage});
	}
	function setNotVisible(room : any) { //Supprime un room des rooms visibles
		$client.socket.emit("set_room_not_visible", {room_name: room.room });
		$chatRoom.deleteRoom(room.room);
	}

	function set_private_room()
	{
		$client.socket.emit("set_room_private", {room_name: $chatRoom.actualRoomName});
	}
	function unset_private_room()
	{
		$client.socket.emit("unset_room_private", {room_name: $chatRoom.actualRoomName});
	}
	function set_password_room()
	{
		let password = prompt("Enter the new passwod's room: ");
		$client.socket.emit("set_password_room", {room_name: $chatRoom.actualRoomName, password: password});
	}
	function unset_password_room()
	{
		$client.socket.emit("unset_password_room", {room_name: actualName});
	}
	function banUser(username)
	{
		let date : any = prompt("Date: ")
		let res : Date;
		if (date)
		{
			res = new Date(date);
			console.log(res);
			if (isNaN(res.getTime()))
				alert("Bad date");
			else 
				$client.socket.emit("ban_user", { room_name : $chatRoom.actualRoomName, username_ban: username, ban_end: res});
		}
	}
	function setAdmin(username)
	{
		$client.socket.emit("set_admin", { room_name : $chatRoom.actualRoomName, username_new_admin: username});
	}
	function muteUser(username)
	{
		let date : any = prompt("Date: ")
		let res : Date;
		if (date)
		{
			res = new Date(date);
			console.log(res);
			if (isNaN(res.getTime()))
				alert("Bad date");
			else 
				$client.socket.emit("mute_user", { room_name : $chatRoom.actualRoomName, username_ban: username, mute_end: res});
		}
	}
</script>

<Modal bind:this={addRoomModal}>
	<AddRoom itself={addRoomModal} />
</Modal>

<Modal bind:this={allChatRoomModal}>
	<AllChatRooms itself={allChatRoomModal} />
</Modal>

<div class="flex window chat">
	<div class="rooms">
		<div class="flex tools">
			<button on:click={() => { addRoomModal.open(); }}>Add</button>
			<button on:click={() => { allChatRoomModal.open(); }}>Join</button>
		</div>
		<div class="vflex list">
			<p>RoomList</p>
			{#each ($chatRoom?.sortRoomsKeys([...$chatRoom.messages.keys()])) as room}
			<div class="flex line">
				{#if (room != actualName)}
				<div class="room" on:click={() => chooseRoom({room})}>{room}</div>
				{:else}
				<div class="room chosen" on:click={() => chooseRoom({room})}>{room}</div>
				{/if}
				<div class="button" on:click={() => setNotVisible({room})}>
				<p>Quit</p>
				</div>
			</div>
			{/each}
		</div>
	</div>
	
	<!--Zone de liste des messages de la room selectionne-->
	<!-- <div class="vflex chatroom" bind:this={message_zone}> -->
	<div class="vflex chatroom">
		{#if ($chatRoom.actualRoomName !== "")}
			<div class="read">
			{#if actualMessages.is_owner}
				{#if actualMessages.is_private}
					<input class="button" value="Set private" on:click={unset_private_room}>
				{:else}
					<input class="button" value="Set private" on:click={set_private_room}>
				{/if}
				{#if actualMessages.is_password_protected}
					<input class="button" value="delete password" on:click={unset_password_room}>
					<input class="button" value="Change password" on:click={set_password_room}>
				{:else}
					<input class="button" value="add password" on:click={set_password_room}>
				{/if}

			{/if}
			{#each actualMessages?.messages as message}
				<ChatRoomMessage username={message.username} content_message={message.message} itself={ itself } axelUserProfileModal={axelUserProfileModal} is_admin={actualMessages.is_admin}/>
			{/each}
			</div>
			<div class="write">
				<input class="text-input" placeholder="write your message here..." bind:value={newMessage}>
				<button on:click={sendMessage}>send</button>
			</div>
		{:else}
			<div class="flex no-select">
				<h2>Please select a room</h2> 
			</div>
		{/if}
	</div>

	<div class="vflex users">
		<p>Online</p>
		<div class="vflex list">
			{#each actualMessages?.usersRoom as actual_user}
			<div class="user">
				<div>{actual_user.username}</div>
				<!-- <input type="button" class="btn-room" value="mute" on:click={()=>muteUser(actual_user.username)}/>
				<input type="button" class="btn-room" value="ban" on:click={()=>banUser(actual_user.username)}/>
				<input type="button" class="btn-room" value="set Admin" on:click={()=>setAdmin(actual_user.username)}/> -->
			</div>
			{/each}
		</div>
	</div>
</div>