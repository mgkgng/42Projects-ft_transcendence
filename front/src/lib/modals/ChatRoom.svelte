<style lang="scss">
	.container {
		display: flex;
		flex-direction: row;
		margin-top: 3vh;
		width: 700px;
		height: 75%;
		max-height: 90vh;
		background-color: transparentize(rgb(255, 0, 0), 0.9);
		padding: 2em;
		border-radius: 2em;
	}
	
	.room-zone {
		width: 25%;
		background-color: transparentize(#000, 0.2);
		border: 2px solid transparentize(#fff, .6);
		border-radius: 0.5em;
	}
	.message-zone {
		width: 50%;
		padding-left: 1em;
		background-color: transparentize(#000, 0.2);
		border: 2px solid transparentize(#fff, .6);
	
		color: #fff;	
		display: flex;
		flex-direction: column;
		padding: 1em;
		gap: .5em;
		overflow-y: scroll;
	}
	.new-chat-room-zone{
		width: 25%;
		padding-left: 1em;
		min-height: 500px;
		background-color: transparentize(#000, 0.2);
		border: 2px solid transparentize(#fff, .6);
	
		display: flex;
		flex-direction: column;
		gap: .5em;

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
	.text-input {
		background-color: #fff;
		color: #000;
	}
</style>

<script lang="ts">
	// export let userInfo;

    import { client } from "$lib/stores/client";
    import { chatRoom, ChatRooms, Room } from "$lib/stores/chatRoom";
	import { onMount, afterUpdate } from "svelte";
	import { get } from 'svelte/store';
    import ChatRoomMessage from "$lib/tools/chatRoomMessage.svelte";

	export let itself: any; 
	export let allChatRoomsModal : any;
	export let axelUserProfileModal : any;

	let newRoomName : string; //Valeur du insert de création de room
	let newMessage : string;  //Valeur du insert d'envoie de message
	let newRoomPassword : string; //Valeur du insert, password

	let rooms : string[]; //Rooms visibles par le user
	let actualName: string; //Name de la room selectionnee
	let actualMessages : Room = new Room("", false, false, false);

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
</script>

<div class="container">
	<!--Zone de liste des rooms du user-->
	<div class="room-zone">
		<input class="btn-room search" value="search" on:click={() =>{
			allChatRoomsModal.open();
			itself.close();	
		}}>
		<ul>
		{#each ($chatRoom.sortRoomsKeys([...$chatRoom.messages.keys()])) as room}
			<li>
				{#if (room != actualName)}
					<button class="btn-room" on:click={chooseRoom({room})}>{room}</button>
				{:else}
					<button class="btn-room choose" on:click={chooseRoom({room})}>{room}</button>
				{/if}
				<button class="btn-room" on:click={setNotVisible({room})}>X</button>
			</li>
		{/each}
		</ul>
	</div>
	<!--Zone de liste des messages de la room selectionne-->
	<div class="message-zone" bind:this={message_zone}>
		{#if ($chatRoom.actualRoomName !== "")}
			{#each actualMessages?.messages as message}
				<ChatRoomMessage username={message.username} content_message={message.message} itself={ itself } axelUserProfileModal={axelUserProfileModal} is_admin={actualMessages.is_admin}/>
			{/each}
			<input class="text-input" bind:value={newMessage}>
			<input type="button" class="submit" value="send" on:click={sendMessage}>
		{:else}
			choose a room 
		{/if}
	</div>
	<!--Zone de creation de room -->
	<div class="new-chat-room-zone">
		<h5 style="color: white">Add new room :</h5><br>
		<input class="text-input" placeholder="NameRoom" bind:value={newRoomName}>
		<div style="display: flex; flex-direction: row;">
			<p style="color: white">password ?</p>
			<input type="checkbox" id="is_pass_protected" name="scales" bind:checked={is_new_room_password_protected}>
		</div>
		{#if (is_new_room_password_protected == true)}
			<input class="text-input" placeholder="password" bind:value={newRoomPassword}>
		{/if}
		<input type="button" value="+" class="btn-new-room" on:click={createRoom}/>
	</div>

</div>