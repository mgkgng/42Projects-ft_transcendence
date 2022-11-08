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
	}
</style>

<script lang="ts">

	import { chatRoom } from "$lib/stores/chatRoom.ts";
	import { client } from "$lib/stores/client.ts";
	import { onMount } from "svelte";

	export let itself : any;
	export let ChatRoomsModal : any;
	let username : string = "";
	chatRoom.subscribe((value) => {
		username = value.username_search;
	});
	let user_info = null;
	onMount(async () => {
		console.log("Here ");
		$client.socket.emit("get_other_user_info", { username_search: username } );
		$client.socket.on("get_other_user_info", (data) => {
			user_info = data;
			console.log("USER PROFILE: ", user_info);
		});
		$client.socket.on("error_get_other_user_info", (data) => {
			alert("Error: " + data);	
		});
	});
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
		<button>
			<img src="/logo-test/add.svg" alt="add"/>
		</button>
		<button>
			<img src="/logo-test/block.svg" alt="add"/>
		</button>
		<button>
			<img src="/logo-test/chat.svg" alt="add"/>
		</button>
	</div>
	<div class="info-zone">
		<p>Username: {user_info.username}</p>
		<p>Campus : {user_info.campus_name}, {user_info.campus_country}</p>
	</div>
	<div class="history-zone">
		No Game History Yet
	</div>
	{/if}
</div>