<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		gap: 0;
		margin: 0;
		width: 550px;
		background-color: transparentize(#000, 0.9);
		padding: 2em;
		border-radius: 2em;
	}
	
	.photo-zone {
		width: 100%;
		min-height: 200px;
		background-color: transparentize(#000, 0.2);
		
		img {
			width: 100%;
		}
	}

	.tool-zone {
		width: 100%;
		height: 80px;
		border-radius: .4em;
		margin-top: .5em;
		margin-bottom: .2em;
		padding: 1em;
		
		border: 2px solid transparentize(#fff, .6);
		background-color: transparentize(#000, 0.45);
		color: #e6e6e6;

		display: flex;
		flex-direction: row;
		gap: .5em;

		button {
			width: 5em;
			aspect-ratio: 1 / 1;
			border-radius: 1em;
			border: 2px solid transparentize(#fff, .5);
			cursor: pointer;
			transition: .2s;

			img {
				width: 100%;
				height: 100%;
			}

			&:hover {
				transform: scale(1.05);
			}
		}
	}

	.info-zone {
		width: 100%;
		display: flex;
		flex-direction: column;
		max-height: 400px;
		border-radius: .4em;
		margin-bottom: .2em;

		text-align: center;

		border: 2px solid transparentize(#fff, .6);
		background-color: transparentize(#000, 0.45);

		padding: 2em;

		color: #e6e6e6;
	}

	.history-zone {
		width: 100%;
		min-height: 200px;
		border-radius: .3em;

		text-align: center;

		border: 2px solid transparentize(#fff, .6);
		padding: 1.2em;
		background-color: transparentize(#000, 0.45);

		color: #e6e6e6;
		font-size: 36px;
	}
	.btn-room{
		width: 20%;
		border-radius: 0.5em;
		color:rgb(255, 255, 255);
		text-align: center;
		margin-left: 40%;
		background-color: rgba(97, 97, 97, 0.5);
		cursor: pointer;
	}
	.back{
		padding: 0em;
		width: 50px;
		height: 50px;
		margin-right: 1em;
	}
</style>

<script lang="ts">

	import { chatRoom } from "$lib/stores/chatRoom.ts";
	import { client } from "$lib/stores/client.ts";
	import { onMount } from "svelte";
    import { browser } from '$app/environment';

	export let itself : any;
	export let ChatRoomsModal : any;
	let username : string = "";
	let local_username : string;
	let new_username : any = "";
	let user_info = null;

	client.subscribe(value => {	local_username = value.username;	});
	chatRoom.subscribe(value => {	username = value.username_search;	});
	onMount(() => {
		$client.socket.off("get_other_user_info", (data) => {});
		$client.socket.on("get_other_user_info", (data) =>
		{
			user_info = data;
		});

		$client.socket.off("error_get_other_user_info", (data) => {
		});
		$client.socket.on("error_get_other_user_info", (data) => {
			itself.close();
			ChatRoomsModal.open();
			alert("Error: " + data);	
		});
		$client.socket.off("error_change_username", (data) => {
		});
		$client.socket.on("error_change_username", (data) => {
			itself.close();
			ChatRoomsModal.open();
			alert("Error: " + data);	
		});
		$client.socket.off("change_username", (data) => {
		});
		$client.socket.on("change_username", (data) => {
			$client.socket.emit("get_user_info",{});
			chatRoom.update((value) => {
				value.username_search = data.new_username;
				return value;
			});
			$client.socket.emit("get_other_user_info", { username_search: username } );
			console.log("client", $client, $chatRoom);
			console.log("THIS", username, local_username);
		});

		$client.socket.emit("get_other_user_info", { username_search: username } );
	});
	function sendMessage()
	{
		new_username = prompt("Enter new username");
		$client.socket.emit("change_username", { new_username: new_username });
	}
</script>

<div class="container">
	<button class="btn-room back" on:click={() => {
		itself.close();
		ChatRoomsModal.open();
	}}>&lt</button>
	{#if user_info}
	<div class="photo-zone">
		<img src={user_info.img_url} alt="grosse-tete">
	</div>
	<div class="tool-zone">
		{#if local_username != username}
			<button>
				<img src="/logo-test/add.svg" alt="add"/>
			</button>
			<button>
				<img src="/logo-test/block.svg" alt="add"/>
			</button>
			<button>
				<img src="/logo-test/chat.svg" alt="add"/>
			</button>
		{/if}
	</div>
	<div class="info-zone">
		<p>Username: {user_info.username}</p>
		{#if local_username == username}
			<input class="btn-room" type="button" value="Change" on:click={sendMessage} />
		{/if}
		<p>Campus : {user_info.campus_name}, {user_info.campus_country}</p>
	</div>
	<div class="history-zone">
		No Game History Yet
	</div>
	{/if}
</div>