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
		width: 100%;
		background-color: transparentize(#000, 0.2);
		border: 2px solid transparentize(#fff, .6);
		border-radius: 0.5em;
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
    import ChatRoom from "./ChatRoom.svelte";
	

	let rooms : string[];
	let all_rooms : Map<string, boolean> = new Map();
	let value : string = "";	
	chatRoom.subscribe(chat => { rooms = chat.rooms;});
	onMount (() => {
		$client.socket.emit("get_all_rooms", {});
		$client.socket.on("get_all_rooms", (data : any) => {
			console.log("ALLROOMS", data);
			for (let r of data)
				all_rooms.set(r.name, r.is_password_protected);
		});
	});
	function addToTheRoom(room : any)
	{
		let user_password : string = "";
		if (all_rooms.get(room) == true)
		{
			//take password
		}
		$client.socket.emit("append_user_to_room", {room_name: room, password: user_password});				
	}
	function changethings()
	{
		value = "hello";
		console.log([...all_rooms.keys()]);
	}
</script>

<div class="container">
	<div class="room-zone" on:click={changethings}>
		<ul>
		<h1>{value}</h1>
		{#each [...all_rooms.keys()] as room_name}
			<li>
				<p>{room_name}</p>
				{#if !(room_name in rooms)}
					<button class="btn-room" on:click={addToTheRoom(room_name)}>Add</button>
				{/if}
			<li>
		{/each}
		</ul>
	</div>
</div>