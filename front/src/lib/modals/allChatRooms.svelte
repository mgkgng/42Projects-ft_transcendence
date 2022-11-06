<style lang="scss">
	.container {
		display: flex;
		flex-direction: row;
		width: 550px;
		height: 75%;
		//max-height: 90%;
		background-color: transparentize(rgb(255, 0, 0), 0.9);
		padding: 2em;
		border-radius: 2em;
	}
	
	.room-zone {
		width: 100%;
		color:rgb(255, 255, 255);
		max-height: 90%;
		background-color: transparentize(#000, 0.2);
		border: 2px solid transparentize(#fff, .6);
		border-radius: 0.5em;
		overflow-y: scroll;
	}
	.btn-room{
		padding: 1em;
		width: 10%;
		color:rgb(255, 255, 255);
		text-align: center;
		background-color: rgba(97, 97, 97, 0.5);
		cursor: pointer;
	}
</style>

<script lang="ts">

    import { client } from "$lib/stores/client";
    import { chatRoom } from "$lib/stores/chatRoom";
	import { onMount, beforeUpdate } from "svelte";
	

	let rooms : string[];
	let all_rooms : Map<string, boolean> = new Map();
	chatRoom.subscribe(chat => { rooms = chat.rooms;});
	chatRoom.subscribe(chat => { all_rooms= chat.all_rooms;});
	onMount(() => {
		$client.socket.emit("get_all_rooms", {});
	});
	function addToTheRoom(room : any)
	{
		let user_password : string = "";
		if (all_rooms.get(room) == true && user_password == "")
		{
			user_password = prompt("Please enter the password", "");
		}
		$client.socket.emit("append_user_to_room", {room_name: room, room_password: user_password});				
	}
</script>

<div class="container">
	<div class="room-zone">
		<ul>
		{#each ([...all_rooms.keys()]) as room_name}
			{#if (rooms.includes(room_name)) == false}
				<li>
				<p>{room_name}</p>
					<button class="btn-room" on:click={addToTheRoom(room_name)}>Add</button>
				</li>
			{/if}
		{/each}
		</ul>
	</div>
</div>