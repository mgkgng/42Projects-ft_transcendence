<style lang="scss">
	.password {
		gap: .2em;
	}
</style>

<script lang="ts">
    import { client } from "$lib/stores/client";
    import { onMount } from "svelte";

	export let itself;
	export let roomID;

	let password: string = "";

	onMount(() => {
		$client.socket.on("error_append_user_to_room", (data: any) => {
			console.log(data);
		});

		return(() => {
			$client.socket.off("error_append_user_to_room");
		})
		
	})
</script>

<div class="vflex window password">
	<input type="password" placeholder="Password" bind:value={password}>
	<div class="buttons">
		<button on:click={() => {}}>Cancel</button>
		<button on:click={() => { $client.socket.emit("append_user_to_room"); }}>Enter</button>
	</div>
</div>