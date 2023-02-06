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
		gap: .1em;

		label {
			display: inline-block;
			border: $border;
			border-radius: .2em;
			width: 6em;
			height: 2.5em;
			text-align: center;
			padding: .5em;
			font-size: 17px;
			cursor: pointer;
		}
		input { display: none; }
		input:checked + label { background-color: $main-bright; }

		button {
			width: 6em;
			height: 2.5em;
			background-color: $submain-blue;
			border: $border;
			border-radius: .2em;
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

		padding: 12em 1em;
	}

	.button-back {
		width: 100%;
		height: 100%;

		transition: .3s;
		border-radius: .6em;
		border: none;
		background-color: transparentize(#fff, 1);
		font-size: 25px;

		&:hover {
			display: block;
			background-color: transparentize($main-lowshade, 0.3);
		}
	}

	.page {
		position: absolute;
		bottom: 2em;
		height: 2em;
		background-color: #212121;
		border: $border;
		gap: 0;

		justify-content: center;
		align-items: center;

		.info {
			border-left: $border;
			border-right: $border;
			width: 5em;
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
			transition: .1s;

			&:hover { background-color: $main-bright; }
		}
	}
</style>

<script lang="ts">
	import { onMount } from "svelte";
	import { client } from "$lib/stores/client";
	
	export let itself: any;
	export let enterGameModal: any;

	let rooms: Array<any> = [];
	let roomArray: Array<any> = [];
	let roomsOnPage: Array<any> = [];
	let showAvailable: boolean = true;
	let roomPage: number = 0;
	let perPage: number = 3;

	let roomListReqs: any;

	$: roomArray = (showAvailable) ? rooms?.filter(room => room.players.length < 2) : rooms;
	$: roomsOnPage = roomArray?.slice(roomPage * perPage, roomPage * perPage + perPage);
	$: roomPageNb = Math.ceil(roomArray?.length / perPage);
	$: console.log("rooms", rooms)
	$: console.log("Array: ", roomArray)
	$: console.log("onpage:", roomsOnPage);

	function movePage(left: boolean){
		if (left && (roomPage - 1) * perPage >= 0)
			roomPage--;
		else if (!left && (roomPage + 1) * perPage < roomArray.length)
			roomPage++;
	}

	function joinRoom(roomID: string, playMode: boolean) {
		$client.socket.emit("JoinRoom", {
			roomID: roomID,
			play: playMode
		})
	}

	// Set automatic refresh for every 30 seconds 
	function refresh() {
		$client.socket.emit("RoomListReq");
		if (roomListReqs)
			clearInterval(roomListReqs);
		roomListReqs = setInterval(() => {
			$client.socket.emit("RoomListReq");
		}, 30000);
	}

	onMount(() => {
		$client.socket.on("RoomListRes", (data: any) => {
			rooms = data;
		});

		refresh();

		return (() => {
			$client.socket.off("RoomListRes");
			clearInterval(roomListReqs);
		})
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
		<input type="checkbox" id="only" bind:checked={showAvailable} />
		<label for="only">Available</label>
		<button on:click={() => { refresh(); }}>Refresh</button>
	</div>
	<div class="flex room-container">
		{#each roomsOnPage as room}
		<div class="vflex room-card">
			<div class="title">
				{room.gameInfo.title}
			</div>
			<div class="flex players">
				{#if room.players[0].img_url.includes("cdn.intra.42.fr")}
					<img src={room.players[0].img_url} alt="player1" />
				{:else}
					<img src='http://{location.hostname}:3000{room.players[0].img_url}' alt="player1" />
				{/if}
				{#if room.players.length > 1}
					{#if room.players[1].img_url.includes("cdn.intra.42.fr")}
						<img src={room.players[1].img_url} alt="player2" />
					{:else}
						<img src='http://{location.hostname}:3000{room.players[1].img_url}' alt="player2" />
					{/if}
				{:else}
				<div class="grey-box">?</div>
				{/if}
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
	</div>
	<div class="flex page">
		<button on:click={()=>movePage(true)}>&lt;</button>
		<span class="info">{roomPage + 1} / {(roomPageNb) ? roomPageNb : 1}</span>
		<button on:click={() => movePage(false)}>&gt;</button>
	</div>
</div>