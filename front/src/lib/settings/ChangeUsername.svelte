<style lang="scss">

</style>

<script lang="ts">
    import { user } from "$lib/stores/user";
    import { onMount } from "svelte";
    import { client } from "../stores/client";

	export let itself: any;
	
	let newUsername: string = "";

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

<div class="flex window input">
	<input type="text-input" placeholder="Put your new username here" bind:value={newUsername}>
	<button on:click={() => {
		console.log("test");
		// $client.socket.emit("change_username", newUsername);
	}}>Modify</button>
</div>