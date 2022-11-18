<style lang="scss">
	.container {
		display: flex;
		flex-direction: row;
		width: 550px;
		height: 75%;
		max-height: 90vh;
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
		width: 20%;
		border-radius: 0.5em;
		color:rgb(255, 255, 255);
		text-align: center;
		background-color: rgba(97, 97, 97, 0.5);
		cursor: pointer;
	}
	.back{
		padding: 0em;
		width: 50px;
		height: 50px;
		margin-right: 1em;
		border-radius: 0.5em;
		color:rgb(255, 255, 255);
		text-align: center;
		background-color: rgba(97, 97, 97, 0.5);
		cursor: pointer;
	}
	.room{
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		padding: 0.2em;
		margin: 0.5em;
		border-color: #fff;
		border-width: 1px;
		border-style: solid;
	}
	.research-zone{
		display: flex;
		flex-direction: row;
		padding: 0.2em;
		margin: 0.5em;
		height: 40px;
	}
	.text-input{
		margin : 0.5em;
		background-color: white;
		color: black;
	}
</style>

<script lang="ts">

    import { client } from "$lib/stores/client";
    import { chatRoom } from "$lib/stores/chatRoom";
	import { onMount, beforeUpdate } from "svelte";
	
	export let itself: any; 
	export let ChatRoomsModal : any;

	let rooms : string[];
	let all_rooms : Map<string, boolean> = new Map();
	chatRoom.subscribe(chat => { rooms = chat.rooms;});
	chatRoom.subscribe(chat => { all_rooms= chat.all_rooms;});

	let research : string = "";
	onMount(() => {
		$client.socket.emit("get_all_rooms_begin_by", {research: research});

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
	function researchRooms()
	{
		// console.log("changed")
		$client.socket.emit("get_all_rooms_begin_by", {research: research});

	}
</script>

<div class="container">
	<button class="btn-room back" on:click={() => {
		itself.close();
		ChatRoomsModal.open();
	}}>&lt</button>
	<div class="room-zone">
		<div class="research-zone">
			<input class="text-input" bind:value={research}>
			<button class="btn-room" on:click={researchRooms}>Search</button>
		</div>
		<ul>
		{#each ([...all_rooms.keys()].sort()) as room_name}
			{#if (rooms.includes(room_name)) == false}
				<li class="room">
					<p>{room_name}</p>
					<button class="btn-room" on:click={addToTheRoom(room_name)}>Add</button>
				</li>
			{/if}
		{/each}
		</ul>
	</div>
</div>