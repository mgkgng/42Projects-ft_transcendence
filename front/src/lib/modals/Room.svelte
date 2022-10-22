<style lang="scss">
	.container {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.pong {
		position: relative;

		padding: 0;
		border: dashed 3px white;
		border-radius: 2.5em;

		background-color: #000;
		// display: flex;
		// justify-content: center;
		// align-items: center;
	}

	.test {
		position: absolute;
		width: 10px;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		background-color: blue;

		z-index: 4;
	}

	.bar-container-above {
		position: relative;
		display: flex;
		align-items: center;
	}

	.bar-container-below {
		position: relative;
		display: flex;
		align-items: center;
	}

	.central-line-vertical {
		position: absolute;
		left: 50%;
		height: 100%;
		border: dashed 3px aqua;
	}

	.central-line-horizontal {
		position: absolute;
		top: 50%;
		width: 100%;
		height: 0;
		border: dashed 3px aqua;
	}


	.beyond-above {
		background-color: transparentize($main, 0.2);
		border-radius: 5em 5em 0 0;
	}

	.beyond-below {
		background-color: transparentize($main, 0.2);
		border-radius: 0 0 5em 5em;
	}

	.map {
		display: flex;
		background-color: transparentize($main, 0.9);
	}

	.main-circle {
		width: 50%;
		height: 50%;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		background-color: transparentize($main, 0.2)
	}

	.pong-score {
		display: flex;
		flex-direction: column;

		justify-content: center;
		height: 100%;

		gap: 1em;
	}

	.deathPoint {
		position: absolute;
		width: 12px;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		background-color: peru;
		z-index: 10;
	}

	.loading-box {
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.msg {
		color: #fff;
	}

	button {
		width: 50px;
		height: 20px;
		background-color: blue;
		cursor: pointer;
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import DarkMode from "$lib/DarkMode.svelte";
	import { client } from "$lib/stores/client";
	import { UserType } from '$lib/stores/var';
	import Paddle from '$lib/Paddle.svelte';
	import { Puck } from '$lib/pong/Puck';
    import PongPuck from '$lib/PongPuck.svelte';
    import ScoreBox from '$lib/ScoreBox.svelte';
    import { GameMap } from '$lib/pong/GameMap';
    import Modal from '$lib/tools/Modal.svelte';
    import GameOver from '$lib/modals/GameOver.svelte';

	export let roomId: string;

	let roomInfo: any;

	// let gameMap = new GameMap(mapWidth.Small, mapHeight.Small, PaddleSize.Medium);

	// TODO GameMap info should go into the pong's constructor
	let puck: any = undefined;
	let scores: Array<number> = [0, 0];

	let userType: number;
	let userIndex: number = UserType.Player1;
	let opponentIndex: number = UserType.Player2;

	let initPos = (roomInfo?.mapSize[0] + roomInfo?.paddleSize) / 2;
	let paddlePos: Array<number> = [initPos, initPos];


	let grapped = false;

	let deathPoint: number;

	let moving = false;
	
	let puckMoving: any;
	
	let gameFinishedModal: any;

	let roomFound: boolean;
	
	function roomcheck() {
	}

	onMount(()=> {
		$client.socket.on("connection", () => {
			$client.socket.emit("RoomCheck", {
				client: $client.id,
				room: roomId
			});
		});

		$client.socket.on("RoomInfo", (data: any) => {
			console.log("RoomInfo", data);
			roomFound = true;
			roomInfo = data;
		});

		// plus tard je le rends plus beau
		if (roomInfo?.players.length > 1)
			userType = UserType.Player1;
		else
			userType = ($client.id == roomInfo?.players[0]) ? UserType.Player1 
				: ($client.id == roomInfo?.players[1]) ? UserType.Player2 
				: UserType.Watcher;

		if (userType == UserType.Player2) {
			[userIndex, opponentIndex] = [opponentIndex, userIndex];
			// TODO (this is kinda brut force)
			paddlePos[0] -= roomInfo?.paddleSize, paddlePos[1] -= roomInfo?.paddleSize;
		}

		scores = roomInfo?.scores;
		
		$client.socket.on("PaddleUpdate", (data: any) => {
			console.log("PaddleUpdate", data);
			if ((data.player == UserType.Player1 && userIndex == UserType.Player2) ||
				(data.player == UserType.Player2 && userIndex == UserType.Player2))
				paddlePos[data.player] = data.paddlePos;
			else
				paddlePos[data.player] = roomInfo?.mapSize[0] - data.paddlePos;

			// data.paddlePos;
		});

		$client.socket.on("LoadBall", (data: any) => {
			console.log("LoadBall");
			puck = new Puck(roomInfo?.mapSize[0], roomInfo?.mapSize[1], data.vectorX, data.vectorY);
		});

		$client.socket.on("PongStart", (data: any) => {
			console.log("PongStart", data);

			puckMoving = setInterval(() => {
				puck.move();
				puck = puck;
			}, 20);
		});

		$client.socket.on("DeathPointUpdate", (data: any) => {
			console.log("DeathPointUpdate");
			deathPoint = data;
		});

		$client.socket.on("PuckHit", (data: any) => {
			console.log("PuckHit");
			puck.vectorY *= -1;
		});
 
		$client.socket.on("ScoreUpdate", (data: any) => {
			console.log("ScoreUpdate", data);
			clearInterval(puckMoving);
			scores[data]++;
			puck = undefined;
		});

		$client.socket.on("GameFinished", (data: any) => {
			console.log("GameFinished");
			console.log((userType == data) ? "You Win!"
				: (userType != UserType.Watcher) ? "You Lose!" 
				: ".");
			gameFinishedModal.open();
		});
	});

</script>

{#if roomFound}
<div class="container">
	{#if roomInfo}
	<div class="pong" style="min-width: {roomInfo?.mapSize[0]}px; min-height: {roomInfo?.mapSize[1]}px;">
		{#if roomInfo.players.length > 1}
		<Paddle pos={paddlePos[opponentIndex]} paddleWidth={roomInfo?.paddleSize}
			gameWidth={roomInfo?.mapSize[0]} gameHeight={roomInfo?.mapSize[1]}
			user={false} userIndex={userIndex}/>
		{/if}
		<!-- <div class="test" style="left: {paddlePos[opponentIndex]}px; top: 50px;"></div> -->
		{#if puck}
		<PongPuck posX={(userIndex == UserType.Player1) ? roomInfo?.mapSize[0] - puck.posX : puck.posX}
			posY={(userIndex == UserType.Player1) ? roomInfo?.mapSize[1] - puck.posY : puck.posY} />
		{/if}
		<Paddle pos={paddlePos[userIndex]} paddleWidth={roomInfo?.paddleSize}
			gameWidth={roomInfo?.mapSize[0]} gameHeight={roomInfo?.mapSize[1]}
			user={true} userIndex={userIndex}/>
		<!-- <div class="test" style="left: {paddlePos[userIndex]}px; top: {roomInfo?.mapSize[1] - 50}px;
		"></div> -->
<!-- 
		{#if deathPoint && puck}
		<div class="deathPoint"
			style="left: {deathPoint}px;
			top: {(puck.vectorY < 0 && userIndex || puck.vectorY > 0 && !userIndex) ? 50 : roomInfo?.mapSize[1] - 50}px;"></div>
		{/if} -->
		<!-- <div class="central-line-vertical"></div>
		<div class="central-line-horizontal"></div>	 -->
	</div>
	<div class="pong-score">
		<!-- solution for now, later it will be an empty score box with question mark -->
		{#if roomInfo.players.length > 1}
		<ScoreBox score={scores[opponentIndex]}/>
		<ScoreBox score={scores[userIndex]}/>
		{/if}
	</div>
	{/if}
	<div class="button-container">
		<!-- there should be a difference between host-guest mode and random matching mode -->
		{#if userType == UserType.Player1}
		<button>
			START
		</button>
		{:else if userType == UserType.Player2}
		<button>
			READY
		</button>
		{/if}

		<button>
			QUIT
		</button>
	</div>
</div>
{:else}
<div class="loading-box">
	<h1 class="msg">LOADING...</h1>
</div>
{/if}

<Modal bind:this={gameFinishedModal} closeOnBgClick={false}>
	<GameOver />
</Modal>

<svelte:window
on:mouseup={()=>{
	grapped = false;
}}

on:mousemove={(event)=>{
	if (grapped)
		console.log(event);
}}

on:keypress={(event) => {
	if (userType == UserType.Watcher
	|| (event.code != 'KeyA' && event.code != 'KeyD'))
		return ;

	if (moving)
		return ;

	moving = true;

	$client.socket.emit("PaddleMove", {
		client: $client.id,
		player: userType,
		room: roomId,
		left: (userType == UserType.Player1 && event.code == 'KeyD'
			|| userType == UserType.Player2 && event.code == 'KeyA')
	});
}}

on:keyup={(event)=>{
	if (event.code != 'KeyA' && event.code != 'KeyD')
		return ;
	
	//* TODO some precision to make
	$client.socket.emit("PaddleStop", $client.id)

	moving = false;
}}

/>