<style lang="scss">
	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;

		justify-content: center;
		align-items: center;

		font-family: sans-serif;
		color: #000;
		text-align: center;
	}

	.tools {
		position: relative;
		left: 30%;
		align-items: right;
		width: 100%;
		height: 20%;
		// border: 2px solid #fff;
	}

	.room-container {
		width: 100%;
		height: 100%;
	}
</style>

<script lang="ts">
	import { onMount } from "svelte";
	import { client } from "$lib/stores/client"

	let rooms: Map<string, any> = new Map();
	let roomArray: Array<any>;
	let seeAvailable: boolean = true;

	$: roomArray = (seeAvailable) ? [...rooms?.values()].filter(room => room.available == true)
		: [...rooms.values()];


	$: console.log(rooms);
	onMount(() => {
		$client.sock.send(JSON.stringify({
			event: "AskRooms",
			data: $client.id
		}));

		$client.addListener("GetAllRooms", (data: any) => {
			for (let roomData of data)
				rooms.set(roomData[0], roomData[1]);
			console.log("GetAllRooms", rooms);
		});

		$client.addListener("UpdateRooms", (data: any) => {
			if (data.method == "ADD")
				rooms.set(data.id, data.roomInfo);
			else
				rooms.delete(data.id);
			rooms = rooms;
		})

		return (() => {
			$client.removeListeners(["GetAllRooms", "UpdateRooms"]);
		})
	});
</script>

<div class="container">
	<div class="tools">
		<label class="form">
			<input type="checkbox" bind:checked={seeAvailable} />
			Available
		</label>
	</div>
	<div class="room-container">
		{#each roomArray as room}
		<div class="room-card">
			{room.id}
		</div>
		{/each}
	</div>
</div>