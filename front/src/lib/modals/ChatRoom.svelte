<style lang="scss">
	.container {
		display: flex;
		flex-direction: row;
		width: 550px;
		height: 75%;
		max-height: 90%;
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
		width: 75%;
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
		width: 15%;
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
		background-color: transparentize($main2, 0.8);
		color: #fff;
		cursor: pointer;
	}
	.submit {
		padding: 1em;
		border-radius: 1em;
		width: 50%;
		border: solid #fff;
		text-align: center;
		background-color: transparentize($main2, 0.8);
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
    import { chatRoom, ChatRooms } from "$lib/stores/chatRoom";
	import { onMount } from "svelte";
	import { get } from 'svelte/store';
    import ChatRoomMessage from "$lib/tools/chatRoomMessage.svelte";
	
	let newRoomName : string;
	let newMessage : string;
	let newRoomPassword : string;

	let rooms : string[];
	let actualRoom : any[];
	let actualName: string;
	let actualMessages : any;

	let is_password_protected : boolean = false;
	chatRoom.subscribe(chat  => { console.log('chat', chat); actualMessages = chat.actualRoom;});
	chatRoom.subscribe(chat => { actualName = chat.actualRoomName;});
	chatRoom.subscribe(chat => { rooms = chat.rooms;});
	chatRoom.subscribe(chat => { actualName = chat.actualRoomName;});
	onMount (() => {
	});
	function  chooseRoom(room : any){
		chatRoom.update(chat => { 
			chat.actualRoom = chat.messages[chat.rooms.indexOf(room.room)];
			chat.actualRoomName = room.room;
			console.log("End", chat);
			return (chat);
		});
	}
	function sendMessage(){
		console.log("newMessage(out)",actualName, newMessage);	
		$client.socket.emit("new_message_room", {room_name: actualName, content_message: newMessage});
	}
	function setNotVisible(room : any) {
		$client.socket.emit("set_room_not_visible", {room_name: room.room });
	}
	function createRoom()
	{
		console.log("newRoomName: ", newRoomName);
		console.log("newRoomName: ", newRoomName);
		if (newRoomPassword != null)
			is_password_protected = true;
		if (newRoomPassword == null)
			newRoomPassword = ""
		$client.socket.emit("new_room", {room_name: newRoomName, is_password_protected: is_password_protected, room_password: newRoomPassword});
	}
</script>

<div class="container">
	<div class="room-zone">
		<ul>
		{#each (rooms) as room}
			<li>
				{#if (room != actualName)}
					<button class="btn-room" on:click={chooseRoom({room})}>{room}</button>
				{:else}
					<button class="btn-room choose" on:click={chooseRoom({room})}>{room}</button>
				{/if}
				<button class="btn-room" on:click={setNotVisible({room})}>X</button>
			<li>
		{/each}
		</ul>
	</div>
	<div class="message-zone">
		{#each (actualMessages) as message}
			<ChatRoomMessage username={message.username} content_message={message.message}/>
		{/each}
		<input class="text-input" bind:value={newMessage}>
		<input class="submit" value="send" on:click={sendMessage}>
	</div>
	<div class="new-chat-room-zone">
		<input class="text-input" bind:value={newRoomName}>
		<input class="text-input" bind:value={newRoomPassword}>
		<input type="button" value="+" class="btn-new-room" on:click={createRoom}/>
	</div>
</div>