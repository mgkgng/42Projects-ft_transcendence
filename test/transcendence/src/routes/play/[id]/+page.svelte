<script lang="ts">
	import { page } from "$app/stores";
    import Room from "$lib/Room.svelte";
    import RoomNotFound from "$lib/RoomNotFound.svelte";
	import { client } from "$lib/stores/client";
    import { onMount } from "svelte";

	let roomId = $page.params.id;
	let roomRes: boolean;

	onMount(() => {
		$client.sock.send(JSON.stringify({
			event: 'RoomCheck',
			data: {
				client: $client.id,
				room: roomId
			}
		}))

		$client.addListener("RoomInfo", (data: any) => {
			console.log("RoomInfo", data);
			roomRes = data;
		})
	});
</script>

{#if roomRes}
<Room />
{:else}
<RoomNotFound />
{/if}