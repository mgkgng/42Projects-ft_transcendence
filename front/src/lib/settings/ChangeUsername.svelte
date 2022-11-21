<style lang="scss">
	.modify {
		width: 18em;
		height: 9em;
		padding: 1em;
		padding-top: 3em;

		.message {
			position: absolute;
			top: 1em;
			left: 20%;
			color: $red;
			// make font bold
		}
		.input {
			width: 100%;
			height: 40%;
			gap: .5em;
		
			input {
				width: 90%;
				background-color: #fff;
				padding-left: .5em;
				border-radius: .2em;
				color: #000;
			}
			
		}
		.buttons {
			position: absolute;
			left: 4em;
			bottom: 1em;
			gap: .2em;
	
			button {
				border: $border-thin;
				border-radius: .1em;
				width: 5em;
				height: 2.5em;
			}
		}
	}
</style>

<script lang="ts">
    import { user } from "$lib/stores/user";
    import { onMount } from "svelte";
    import { client } from "../stores/client";

	export let itself: any;
	
	let newUsername: string = "";
	let message: string = "coucou";

	onMount(() => {
		$client.socket.on("error_change_username", (data) => {
			console.log("Error: " + data);	
		});

		// 	$client.socket.on("change_username", (data) => {
		// 		chatRoom.update((value) => {
		// 			value.username_search = data.new_username;
		// 			return value;
		// 		}); 
		//	});
		return (() => {
			$client.removeListeners("error_change_username", "change_username");
		});
	});
</script>

<div class="flex window modify">
	<div class="message">
		coucou
	</div>
	<div class="flex input">
		<input type="text-input" placeholder="Put your new username here" bind:value={newUsername}>
		<button on:click={() => {
			console.log("test");
			// $client.socket.emit("change_username", newUsername);
		}}>Try</button>
	</div>
	<div class="flex buttons">
		<button on:click={() => {
			newUsername = "";
			itself.close();
		}}>Cancel</button>
		<button on:click={() => {
			itself.close();
		}}>Select</button>
	</div>
	
</div>