<style lang="scss">
	.chat {
		width: 60vw;
		height: 75vh;
		gap: .5em;
		padding: 0;
	}

	.rooms {
		width: 22%;
		padding: 0;
		margin: 0;

		.tools {
			width: 100%;
			height: 8%;
			border-bottom: 2px solid transparentize(#fff, .6);
		}

		.list {
			padding: 1em .2em;
			.room {
				
			}
		}
	}

	.chatroom {
		width: 60%;
		border-left: 2px solid transparentize(#fff, .6);
		border-right: 2px solid transparentize(#fff, .6);

		.read {
			overflow-y: scroll;
			padding: 2em;

			width: 100%;
			height: 80%;

		}
		.write {
			position: relative;
			padding-left: 1.5em;
			width: 100%;
			height: 20%;

			border-top: 2px solid transparentize(#fff, .6);

			input {
				width: 100%;
				height: 100%;
				background-color: #212121;
			}

			button {
				position: absolute;
				right: 1em;
				bottom: 1em;
				cursor: pointer;
			}
		}
	}

	.add-room {
		position: relative;
		width: 100%;
		height: 3em;
		border: 2px solid transparentize(#fff, .6);
		background-color: #313131;
		border-radius: .2em;
		align-items: center;
		gap: 0;
	
		p {
			padding-left: .3em;
			font-size: 14px;
		}

		.text-input {
			margin: .5em;
			border-radius: .2em;

			width: 35%;
			height: 1.8em;

			background-color: #fff;
			color: #000;
		}

		.empty {
			margin: .5em;
			border-radius: .2em;

			width: 35%;
			height: 1.8em;
			background-color: #000;
		}

		button {
			width: 3em;
			height: 100%;
			position: absolute;
			right: 0;
			font-size: 25px;
			cursor: pointer;
			background-color: transparentize(#fff, .7);
			
			&:hover {
				background-color: transparentize(#fff, .5);
			}

		}

	}

	.users {
		width: 18%;
	}
	.btn-new-room{
		width: 50%;
		text-align: center;
		padding: 1em;
		border-radius: 1em;
		border: solid #fff;
		background-color: transparentize($submain, 0.8);
		color: #fff;
		cursor: pointer;
	}
	.submit {
		padding: 1em;
		border-radius: 1em;
		width: 50%;
		border: solid #fff;
		text-align: center;
		background-color: transparentize($submain, 0.8);
		color: #fff;
		cursor: pointer;
	}
	.btn-room{
		padding: 1em;
		width: 100%;
		color:rgb(255, 255, 255);
		text-align: center;
		background-color: rgba(97, 97, 97, 0.5);
		cursor: pointer;
	}
	.search{
		margin-left: 20%;
		margin-bottom: 1em;
		margin-top: 1em;
		width: 60%;
		border-style: solid;
		border-color: rgb(255, 255, 255);
		border-width: 2px;
		border-radius: 1em;
	}
	.choose{
		background-color: rgba(207, 196, 196, 0.5);
		text-decoration: underline;
	}
</style>

<script lang="ts">
	// export let userInfo;
	import Modal from "$lib/tools/Modal.svelte";
    import { client } from "$lib/stores/client";
    import { chatRoom, ChatRooms, Room } from "$lib/stores/chatRoom";
	import { onMount, afterUpdate } from "svelte";
    import ChatRoomMessage from "$lib/tools/chatRoomMessage.svelte";

	export let itself: any; 
	export let axelUserProfileModal : any;
	export let allChatModal: any;

	let newRoomName : string; //Valeur du insert de création de room
	let newMessage : string;  //Valeur du insert d'envoie de message
	let newRoomPassword : string; //Valeur du insert, password

	let rooms : string[]; //Rooms visibles par le user
	let actualName: string; //Name de la room selectionnee
	let actualMessages : Room = new Room("", false, false, false, false);

	let is_new_room_password_protected : boolean = false; //Si la room est protege par un mot de passe

	let message_zone;
	
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
			message_zone.scrollTo({top: 1000000000});
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
	function createRoom()
	{
		if (newRoomPassword == null)
			newRoomPassword = ""
		$client.socket.emit("new_room", {room_name: newRoomName, is_password_protected: is_new_room_password_protected, room_password: newRoomPassword, is_private: false});
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

<div class="flex window chat">
	<!--Zone de liste des rooms du user-->
	<!-- <div class="flex add-room">
		<input class="text-input" placeholder="Room Name" bind:value={newRoomName}>
		{#if (is_new_room_password_protected == true)}
		<input class="text-input" placeholder="Password" bind:value={newRoomPassword}>
		{:else}
		<div class="empty"></div>
		{/if}
		<input class="checkbox" type="checkbox" bind:checked={is_new_room_password_protected}>
		<p>Password</p>
		<button on:click={createRoom}>+</button>
	</div> -->

	<div class="rooms">
		<!-- <input class="btn-room search" value="search" on:click={() =>{
			allChatModal.open();
			itself.close();	
		}}> -->
		<div class="tools">
			tools will be here
		</div>
		<div class="list">
			{#each ($chatRoom.sortRoomsKeys([...$chatRoom.messages.keys()])) as room}
			{#if (room != actualName)}
			<div class="room" on:click={() => chooseRoom({room})}>{room}</div>
			{:else}
			<div class="room chosen" on:click={() => chooseRoom({room})}>{room}</div>
			{/if}
			<button on:click={() => setNotVisible({room})}>X</button>
			{/each}
		</div>
	</div>
	
	<!--Zone de liste des messages de la room selectionne-->
	<div class="vflex chatroom" bind:this={message_zone}>
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
			choose a room 
		{/if}
	</div>

	<div class="users">
		{#each actualMessages?.usersRoom as actual_user}
			<input type="button" class="btn-room" value={actual_user.username} />
			<input type="button" class="btn-room" value="mute" on:click={()=>muteUser(actual_user.username)}/>
			<input type="button" class="btn-room" value="ban" on:click={()=>banUser(actual_user.username)}/>
			<input type="button" class="btn-room" value="set Admin" on:click={()=>setAdmin(actual_user.username)}/>
		{/each}
	</div>
</div>