<style lang="scss">

</style>

<script lang="ts">
    import { onMount } from "svelte";
	import { client } from "$lib/stores/client"

	let rooms: Map<string, any> = new Map();

	onMount(() => {
		$client.sock.send(JSON.stringify({
			event: "AskRooms"
		}));

		$client.addListener("UpdateRooms", (data: any) => {
			if (data.method == "ADD")
				rooms.set(data.id, data.roomInfo);
			else
				rooms.delete(data.id);
			rooms = rooms;
		})

		return (() => {
			$client.removeListeners(["UpdateRooms"]);
		})
	});
</script>

<div class="container">
	{#each [...rooms] as room}
	<div class="room"></div>
	{/each}
</div>

