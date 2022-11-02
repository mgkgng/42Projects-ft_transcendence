<style lang="scss">
	.container {
		display: flex;
		flex-direction: row;
		gap: 0;
		margin: 0;
		width: 550px;
		height: 75%;
		background-color: transparentize(rgb(255, 0, 0), 0.9);
		padding: 2em;
		border-radius: 2em;
	}
	
	.room-zone {
		width: 25%;
		min-height: 500px;
		background-color: transparentize(#000, 0.2);
		border: 2px solid transparentize(#fff, .6);
	}
	.message-zone {
		width: 75%;
		padding-left: 1em;
		min-height: 500px;
		background-color: transparentize(#000, 0.2);
		border: 2px solid transparentize(#fff, .6);
	
		display: flex;
		flex-direction: column;
		gap: .5em;
		overflow-y: scroll;
	}
	.message-zone {
		color: #fff;	
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
		background-color: rgba(255, 255, 255, 0.5);
		cursor: pointer;
	}
	.text-input {
		background-color: #fff;
		color: #000;
	}
</style>

<script lang="ts">
	// export let userInfo;

    import { user } from "$lib/stores/user";
    import { client } from "$lib/stores/client";
    import { chatRoom } from "$lib/stores/chatRoom";
	
	let newRoomName : string;
	let newMessage : string;
	let newRoomPassword : string;
	let actualRoom : any;
	let is_password_protected : boolean = false;
</script>

<div class="container">
	<div class="room-zone">
		<ul>
		{#each ($chatRoom.rooms) as room }
			<li>
				<button class="btn-room" on:click={() => {
					actualRoom = $chatRoom.selectRoom({room});
				}}>{room}</button>
			<li>
		{/each}
		</ul>
	</div>
	<div class="message-zone">
		{#each ($chatRoom.actualRoom) as message }
			<div class="message">
				{message.message}
			</div>
		{/each}
		<input class="text-input" bind:value={newMessage}>
		<input class="submit" value="send" on:click={() =>{
			console.log("newMessage");	
			$client.socket.emit("new_message_room", {room_name: actualRoom, content_message: newMessage});
		}}>
	</div>
	<div class="new-chat-room-zone">
		<input class="text-input" bind:value={newRoomName}>
		<input class="text-input" bind:value={newRoomPassword}>
		<input class="btn-new-room" value="+" on:click={() => {
			console.log("newRoomName: ", newRoomName);
			console.log("newRoomName: ", newRoomName);
			if (newRoomPassword != null)
				is_password_protected = true;
			if (newRoomPassword == null)
				newRoomPassword = ""
			$client.socket.emit("new_room", {room_name: newRoomName, is_password_protected: is_password_protected, room_password: newRoomPassword});
		}}>
	</div>
</div>