<style lang="scss">
	.container {
		position: relative;
		width: 100%;
		height: 100%;

		min-width: 1050px;
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
		position: relative;
		border: 2px solid #fff;
		border-radius: 2em;
		width: 15em;
		aspect-ratio: 2 / 3;
		transition: .3s;
		cursor: pointer;
		padding: 2em 0;
		background-color: rgb(33, 33, 33);

		display: flex;
		flex-direction: column;
		align-items: center;

		.title {
			background-color: transparentize(#000, .5);
			padding: .5em 1em;
			border: 2.5px solid transparentize(#fff, .6);
			width: 80%;
			height: 2.7em;
		}

		.players {
			margin-top: 1em;
			margin-bottom: 1em;
			display: flex;
			flex-direction: row;
			gap: .6em;

			img {
				width: 100px;
				height: 100px;
				object-fit: cover;
				border: 2.5px solid transparentize(#fff, .6);
			}

			.grey-box {
				width: 100px;
				height: 100px;
				background-color: #000;
				border: 2.5px solid transparentize(#fff, .6);
				font-family: 'fake-receipt';
				font-size: 80px;
				text-align: center;
				color: transparentize(#fff, .6);
			}
		}

		.info {
			margin-top: .5em;
			display: flex;
			flex-direction: row;
			border: 2.5px solid transparentize(#fff, .6);
			
			div {
				padding: 1em;
				border-right: 2.5px solid transparentize(#fff, .6);

				// &:nth-child(1) {
				// 	background-color: $red;
				// }

				// &:nth-child(2) {
				// 	background-color: $red;
				// }
			}
		}

		.join {
			margin-top: .5em;
			width: 80%;
			z-index: 1;
			background-color: $green;
			// font-family: "fake-receipt";
			font-size: 35px;
		}

		.cover {
			position: absolute;
			bottom: 1em;
			width: 80%;
			height: 4em;
			z-index: 2;
			background-color: #212121;
			transition: .3s ease-out;
		}

		&:hover {
			// opacity: 0.9;

			.cover {
				opacity: 0.3;
			}
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
			background-color: transparentize($main2, 0.5);
		}
	}

	.page {
		position: absolute;
		bottom: 1em;
	}

</style>

<script lang="ts">
	import { onMount } from "svelte";
    import Modal from '$lib/tools/Modal.svelte';
	import Room from "$lib/game/Room.svelte";
	import { client } from "$lib/stores/client";
    import { user } from "$lib/stores/user";

	export let itself: any;
	export let enterGameModal: any;

	let roomModal: any;
	let roomId: string = "";

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

	function joinRoom(roomId: string) {
		$client.socket.emit("JoinRoom", {
			username: $user.username,
			roomId: roomId
		})
	}

	onMount(() => {
		$client.socket.emit("AskRooms", { id: $client.id });

		$client.socket.off("GetAllRooms", (data: any) => {
		});
		$client.socket.on("GetAllRooms", (data: any) => {
			let roomsData = JSON.parse(data.rooms);
			for (let roomData of roomsData)
				rooms.set(roomData[0], roomData[1]);
			roomArray = (seeAvailable) ? [...rooms?.values()].filter(room => room.available == true)
				: [...rooms.values()];
			console.log(roomArray[0]);
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

		$client.socket.on("JoinRoomRes", (data: any) => {
			if (data.allowed) {
				roomId = data.roomId;
				roomModal.open();
				itself.close();
				return ;
			}
			// If couldn't join the game, there should be an error message
			// and also ask for roomsDataUpdate
		});
	});
</script>

<Modal bind:this={roomModal} closeOnBgClick={false}>
	<Room itself={roomModal} roomId={roomId}/>
</Modal>

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
		<button class="left icon-button" on:click={()=>movePage(false)}>&lt;</button>
		{#each roomsOnPage as room}
		<div class="room-card" on:click={()=>joinRoom(room.id)}>
			<div class="title">
				{room.title}
			</div>
			<div class="players">
				<img src={room.players[0].image_url} alt="player1" />
				{#if room.players.length > 1}
				<img src={room.players[1].image_url} alt="player2" />
				{:else}
				<div class="grey-box">?</div>
				{/if}
			</div>
			<div class="info">
				<div>{room.maxpoint}</div>
				<div>{room.difficulty}</div>
				<div>{room.width}</div>
			</div>
			<div class="join">
				JOIN
			</div>
			<div class="cover"></div>
		</div>
		{/each}
		<!-- if less than perPage, gray card -->
		<button class="right icon-button" on:click={() => movePage(true)}>&gt;</button>
	</div>
	<div class="page">
		<span class="middle icon-button">{roomPage + 1} / {Math.ceil(roomArray?.length / perPage)}</span>
	</div>
</div>