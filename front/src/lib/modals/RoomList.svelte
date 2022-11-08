<style lang="scss">
	.container {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;

		justify-content: center;
		align-items: center;

		padding: 5em;
		background-color: transparentize(#fff, 0.65);

		color: #fff;
		border: 2px solid #fff;
		border-radius: 5em;

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

		display: flex;
		flex-direction: row;
		gap: 2em;
	}

	.room-card {
		border: 2px solid #fff;
		border-radius: 2em;
		width: 12em;
		aspect-ratio: 2 / 3;
		transition: .2s;
		cursor: pointer;

		&:hover {
			background-color: transparentize($red, 0.5);
		}
	}

	.button-box {
		position: absolute;
		top: 0;
		left: 0;
		width: 5em;
		height: 100%;

		padding-top: 8em;
		padding-bottom: 8em;
		padding-left: 1em;
		padding-right: 1em;
	}

	.button-back {
		width: 100%;
		height: 100%;

		transition: .3s;
		border-radius: 2em;
		border: none;
		background-color: transparentize(#fff, 1);
		font-size: 25px;

		&:hover {
			display: block;
			background-color: transparentize($main2, 0.8);
		}
	}

</style>

<script lang="ts">
	import { onMount } from "svelte";
	import { client } from "$lib/stores/client";

	export let itself: any;
	export let enterGameModal: any;

	let rooms: Map<string, any> = new Map();
	let roomArray: Array<any>;
	let seeAvailable: boolean = true;
	let roomPage: number = 0;
	let perPage: number = 3;

	$: roomArray = (seeAvailable) ? [...rooms?.values()].filter(room => room.available == true)
		: [...rooms.values()];
	$: roomsOnPage = roomArray.slice(roomPage * perPage, roomPage * perPage + perPage);

	function movePage(left: boolean){
		if (left && (roomPage - 1) * perPage >= 0)
			roomPage--;
		else if (!left && (roomPage + 1) * perPage < roomArray.length)
			roomPage++;
	}

	onMount(() => {
		$client.socket.emit("AskRooms", { id: $client.id });

		$client.socket.off("GetAllRooms", (data: any) => {
		});
		$client.socket.on("GetAllRooms", (data: any) => {
			console.log(data);
			let roomsData = JSON.parse(data.rooms);
			console.log("after", roomsData);
			for (let roomData of roomsData)
				rooms.set(roomData[0], roomData[1]);
			console.log("GetAllRooms", rooms);
			roomArray = (seeAvailable) ? [...rooms?.values()].filter(room => room.available == true)
				: [...rooms.values()];
		});
		$client.socket.off("UpdateRooms", (data: any) => {
		});
		$client.socket.on("UpdateRooms", (data: any) => {
			if (data.method == "ADD")
				rooms.set(data.id, data.roomInfo);
			else
				rooms.delete(data.id);
			rooms = rooms;
		});
	});
</script>

<div class="container">
	<div class="button-box">
		<button class="button-back" on:click={()=>{
			itself.close();
			enterGameModal.open();
		}}>&lt</button>
	</div>
	<div class="tools">
		<label class="form">
			<input type="checkbox" bind:checked={seeAvailable} />
			Available
		</label>
	</div>
	<div class="room-container">
		<button class="left icon-button" on:click={() => movePage(false)}>&lt;</button>
		{#each roomsOnPage as room}
		<div class="room-card">
			{room.title}
		</div>
		{/each}
		<!-- if less than perPage, gray card -->
		<button class="right icon-button" on:click={() => movePage(true)}>&gt;</button>
	</div>
	<span class="middle icon-button">{roomPage + 1} / {Math.ceil(roomArray?.length / perPage)}</span>

	<!-- maybe grid version
	<div class="flex pagination">
		<button class="left-end icon-button" on:click={() => {roomPage = 0}}></button>
		<button class="left icon-button" on:click={() => movePage(false)}>&lt;</button>
		<span class="middle icon-button">{roomPage + 1} / {Math.ceil(roomArray?.length / perPage)}</span>
		<button class="right icon-button" on:click={() => movePage(true)}>&gt;</button>
		<button class="right-end icon-button" on:click={() => {roomPage = Math.ceil(roomArray?.length / perPage) - 1}}></button>
	</div> -->

</div>