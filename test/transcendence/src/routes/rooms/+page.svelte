<style lang="scss">
	.container {
		width: 100%;
		height: 100%;
		display: flex;

		justify-content: center;
		align-items: center;

		color: #fff;
		text-align: center;
	}

	.room-container {
		width: 80%;
		height: 80%;
		border: 2px solid #fff;
		border-radius: 2em;

		padding-top: 2em;

		display: grid;
		grid-template-rows: 10% 5% 80%;

		position: relative;
	}
	.tools {
		position: relative;
		left: 30%;
		align-items: right;
		width: 100%;
		// border: 2px solid #fff;
	}

	.rooms {

	}

	.room {

	}
</style>

<script lang="ts">
    import { onMount } from "svelte";
	import { client } from "$lib/stores/client"

	let rooms: Map<string, any> = new Map();
	let showList: Array<any>;
	let seeAvailable: boolean = true;

	$: console.log(seeAvailable);

	$: showList = (seeAvailable) ? [...rooms.values()].filter(room => room.available == true)
		: [...rooms.values()];

	onMount(() => {
		$client.sock.send(JSON.stringify({
			event: "AskRooms",
			data: $client.id
		}));

		$client.addListener("GetAllRooms", (data: any) => {
			//rooms = 
			// TODO getAllRooms
		});

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
	<div class="room-container">
		<div>
			<h1>Rooms</h1>
		</div>
		<div class="tools">
			<label class="form">
				<input type="checkbox" bind:checked={seeAvailable} />
				Available
			</label>
		</div>
		<div class="rooms">
			{#each showList as room}
			<div class="room">
				
			</div>
			{/each}
		</div>
	</div>
</div>

