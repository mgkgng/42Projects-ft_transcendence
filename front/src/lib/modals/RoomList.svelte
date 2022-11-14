<style lang="scss">
	.container {
		position: relative;
		width: 100%;
		height: 100%;

		min-width: 1050px;

		justify-content: center;
		align-items: center;

		padding: 5em;
		background-color: transparentize(#fff, 0.65);

		color: #fff;
		border: 2px solid #fff;
		border-radius: .5em;

		text-align: center;
	}

	.tools {
		position: absolute;
		top: 1.5em;
		right: 8em;
		width: 12em;
		height: 2.5em;

		border: 2px solid transparentize(#fff, .6);
		border-radius: .2em;
		background-color: #212121;

		label {
			width: 50%;
			height: 100%;
			font-size: 15px;
			cursor: pointer;

			&:nth-child(2) {
				border-left: 2px solid transparentize(#fff, .6); 
			}
			.wrapper {
				position: absolute;
				width: 50%;
				height: 100%;
				padding-top: .7em;
			}

			input {
				display: none;	
			}

			input:checked + .wrapper {
				background-color: $main-lowshade;
			}
		}
	}

	.room-container {
		width: 100%;
		height: 100%;

		gap: 2em;
	}

	.room-card {
		position: relative;
		border: 2px solid transparentize(#fff, .6);
		border-radius: .5em;
		width: 15em;
		aspect-ratio: 2 / 3;
		transition: .3s;
		cursor: pointer;
		padding-top: 1.5em;
		padding-bottom: 1em;
		background-color: #313131;
		justify-content: space-around;

		align-items: center;

		.title {
			background-color: transparentize(#000, .5);
			padding: .5em 1em;
			border: 2.5px solid transparentize(#fff, .6);
			width: 80%;
			height: 2.7em;
		}

		.players {
			gap: .6em;

			img {
				width: 100px;
				height: 100px;
				object-fit: cover;
				border: 2.5px solid transparentize(#fff, .6);
				border-radius: .4em;
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
			border: 2.5px solid transparentize(#fff, .6);
			border-radius: .3em;
			
			div {
				padding: 1em;

				// &:nth-child(1) {
				// 	background-color: $red;
				// }

				&:nth-child(2) {
					height: 100%;
					border-left: 2.5px solid transparentize(#fff, .6);
					border-right: 2.5px solid transparentize(#fff, .6);
				}
			}
		}

		.buttons {
			// margin-top: .5em;
			gap: .5em;

			font-size: 25px;

			button {
				border: 2px solid transparentize(#fff, .6);
				border-radius: .5em;
				padding: .5em;
				cursor: pointer;
				transition: .2s;
			}

			.watch:hover { background-color: $main-bright; }
			.play:hover { background-color: $submain-blue; }
		}
	}

	.empty {
		justify-content: center;
		background-color: #212121;
		h1 {
			font-family: "fake-receipt";
			font-size: 255px;
			color: transparentize(#fff, .6);
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
			background-color: transparentize($submain-bluegreen, 0.5);
		}
	}

	.page {
		position: absolute;
		bottom: 2em;
		height: 2em;
		background-color: #212121;
		border: 2px solid transparentize(#fff, .6);

		justify-content: center;
		align-items: center;

		.info {
			border-left: 2px solid transparentize(#fff, .6);
			border-right: 2px solid transparentize(#fff, .6);
			height: 100%;
			padding: 0 1em;
			padding-top: .3em;
		}

		button {
			height: 100%;
			cursor: pointer;
			padding: 0 .6em;
			padding-bottom: .2em;
			background-color: #313131;
			color: transparentize(#fff, .3);
		}
	}
</style>

<script lang="ts">
	import { onMount } from "svelte";
	import { client } from "$lib/stores/client";
    import { user } from "$lib/stores/user";

	export let itself: any;
	export let enterGameModal: any;

	let rooms: Map<string, any> = new Map();
	let roomArray: Array<any>;
	let showAvailable: boolean = true;
	let showGrid: boolean = false;
	let roomPage: number = 0;
	let perPage: number = 3;

	$: roomArray = (showAvailable) ? [...rooms?.values()].filter(room => room.available == true)
		: [...rooms.values()];
	$: roomsOnPage = roomArray.slice(roomPage * perPage, roomPage * perPage + perPage);
	$: roomPageNb = Math.ceil(roomArray?.length / perPage);

	function movePage(left: boolean){
		if (left && (roomPage - 1) * perPage >= 0)
			roomPage--;
		else if (!left && (roomPage + 1) * perPage < roomArray.length)
			roomPage++;
	}

	function joinRoom(roomId: string, playMode: boolean) {
		$client.socket.emit("JoinRoom", {
			username: $user.username,
			roomId: roomId,
			play: playMode
		})
	}

	onMount(() => {
		$client.socket.emit("AskRooms", { id: $client.id });

		$client.socket.on("GetAllRooms", (data: any) => {
			let roomsData = JSON.parse(data.rooms);
			for (let roomData of roomsData)
				rooms.set(roomData[0], roomData[1]);
			roomArray = (showAvailable) ? [...rooms?.values()].filter(room => room.available == true)
				: [...rooms.values()];
			console.log(roomArray[0]);
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
				itself.close();
				return ;
			}
			// If couldn't join the game, there should be an error message
			// and also ask for roomsDataUpdate
		});

		return (() => {
			// maybe remove listeners here?
		});
	});
</script>

<div class="vflex container">
	<div class="button-box">
		<button class="button-back" on:click={()=>{
			itself.close();
			enterGameModal.open();
		}}>&lt</button>
	</div>
	<div class="flex tools">
		<label class="form">
			<input type="checkbox" bind:checked={showAvailable} />
			<div class="wrapper">Available</div>
		</label>
		<label class="form">
			<input type="checkbox" bind:checked={showGrid} />
			<div class="wrapper">Grid</div>
		</label>
	</div>
	<div class="flex room-container">
		{#each roomsOnPage as room}
		<div class="vflex room-card">
			<div class="title">
				{room.title}
			</div>
			<div class="flex players">
				<img src={room.players[0].image_url} alt="player1" />
				{#if room.players.length > 1}
				<img src={room.players[1].image_url} alt="player2" />
				{:else}
				<div class="grey-box">?</div>
				{/if}
			</div>
			<div class="flex info">
				<div>{room.maxpoint}</div>
				<div>{room.difficulty}</div>
				<div>{room.width}</div>
			</div>
			<div class="flex buttons">
				<button class="watch" on:click={()=>joinRoom(room.id, false)}>WATCH</button>
				<button class="play" on:click={()=>joinRoom(room.id, true)}>PLAY</button>
			</div>
		</div>
		{/each}
		{#if roomsOnPage.length < 3}
		{#each Array(3 - roomsOnPage.length) as _}
		<div class="room-card empty">
			<h1>X</h1>
		</div>
		{/each}
		{/if}
		<!-- if less than perPage, gray card -->
	</div>
	<div class="flex page">
		<button on:click={()=>movePage(false)}>&lt;</button>
		<span class="info">{roomPage + 1} / {(roomPageNb) ? roomPageNb : 1}</span>
		<button on:click={() => movePage(true)}>&gt;</button>
	</div>
</div>