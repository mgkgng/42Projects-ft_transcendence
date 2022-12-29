<style lang="scss">
	.password {
		gap: .2em;
	}
</style>

<script lang="ts">
    import { client } from "$lib/stores/client";
    import { onMount } from "svelte";

	export let itself: any;
	export let roomID: string;

	let password: string = "";
	let message: string = "";

	onMount(() => {
		$client.socket.on("error_append_user_to_room", (data: any) => {
			console.log(data);
		});
		$client.socket.on("success_append_user_to_room", () => {
			itself.close();
		});

		return(() => {
			$client.socket.off("success_append_user_to_room");
			$client.socket.off("error_append_user_to_room");
		});
		
	})
</script>

<div class="vflex window password">
	<input type="password" placeholder="Password" bind:value={password}>
	<div class="buttons">
		<button on:click={() => { itself.close(); }}>Cancel</button>
		<button on:click={() => { $client.socket.emit("append_user_to_room", {
			id_public_room: roomID,
			room_password: password
		}); }}>Enter</button>
	</div>
</div>