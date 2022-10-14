<style lang="scss">
	.container {
		display: grid;
		grid-template-columns: 20% 70% ;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.pong {
		position: relative;

		padding: 0;
		border: dashed 5px white;

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

	.central-line-horizontal {
		position: absolute;
		left: 50%;
		height: 800px;
		border: dashed 3px aqua;
	}

	.central-line-vertical {
		position: absolute;
		top: 50%;
		width: 700px;
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
	}

	.deathPoint {
		position: absolute;
		width: 12px;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		background-color: peru;
		z-index: 10;
	}

	.button-launch {
		width: 50px;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		background-color: peru;
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import DarkMode from "$lib/DarkMode.svelte";
	import { client } from "$lib/stores/client";
	import { UserType } from './stores/var';
	import Paddle from './Paddle.svelte';
    import { Pong } from './pong/Pong';
	import { Puck } from './pong/Puck';
    import PongPuck from './PongPuck.svelte';
    import ScoreBox from './ScoreBox.svelte';
    import { GameMap } from './pong/GameMap';

	export let roomInfo: any;
	export let roomId: string;

	// let gameMap = new GameMap(mapWidth.Small, mapHeight.Small, PaddleSize.Medium);

	// TODO GameMap info should go into the pong's constructor
	let pong = new Pong();
	let puck: any = undefined;
	let scores: Array<number> = [0, 0];

	let paddlePos: Array<number> = [
			(roomInfo.mapSize[0] + roomInfo.paddleSize) / 2, 
			(roomInfo.mapSize[0] - roomInfo.paddleSize)/ 2
	];

	let userType: number;
	let userIndex: number = UserType.Player1;
	let opponentIndex: number = UserType.Player2;

	let grapped = false;

	let deathPoint: number;

	let moving = false;
	
	let puckMoving: any;

	// $: console.log("My Paddle Position: ", pong.paddlePos[userIndex]);

	onMount(()=> {
		userType = ($client.id == roomInfo.players[0]) ? UserType.Player1 
			: ($client.id == roomInfo.players[1]) ? UserType.Player2 
			: UserType.Watcher;
		if (userType == UserType.Player2)
			[userIndex, opponentIndex] = [opponentIndex, userIndex];

		scores = roomInfo.scores;
		console.log(paddlePos);

		console.log("My User Index: ", userIndex);

		$client.addListener("PaddleUpdate", (data: any) => {
			console.log("PaddleUpdate", data);
			if ((data.player == UserType.Player1 && userIndex == UserType.Player2) ||
				(data.player == UserType.Player2 && userIndex == UserType.Player2))
				paddlePos[data.player] = data.paddlePos;
			else
				paddlePos[data.player] = roomInfo.mapSize[0] - data.paddlePos;

			// data.paddlePos;
		});

		$client.addListener("LoadBall", (data: any) => {
			console.log("LoadBall");
			puck = new Puck(pong.gameMap.width, pong.gameMap.height, data.vectorX, data.vectorY);
		});

		$client.addListener("PongStart", (data: any) => {
			console.log("PongStart", data);

			puckMoving = setInterval(() => {
				puck.move();
				puck = puck;
			}, 20);
		});

		$client.addListener("DeathPointUpdate", (data: any) => {
			console.log("DeathPointUpdate");
			deathPoint = data;
		});

		$client.addListener("PuckHit", (data: any) => {
			console.log("PuckHit");
			puck.vectorY *= -1;
		});
 
		$client.addListener("ScoreUpdate", (data: any) => {
			console.log("ScoreUpdate", data);
			clearInterval(puckMoving);
			scores[data]++;
			puck = undefined;
		});

		$client.addListener("GameFinished", (data: any) => {
			console.log("GameFinished");
			console.log((userType == data) ? "You Win!"
				: (userType != UserType.Watcher) ? "You Lose!" 
				: ".");
		})

		return (() => {
			$client.removeListeners(["PaddleUpdate",
				"LoadBall",
				"ScoreUpdate",
				"PuckHit",
				"PongStart"]);
		})
	});

</script>

<div class="container">
	<div class="pong" style="width: {roomInfo.mapSize[0]}px; height: {roomInfo.mapSize[1]}px;">
		<Paddle pos={paddlePos[opponentIndex]} paddleWidth={roomInfo.paddleSize}
			gameWidth={roomInfo.mapSize[0]} gameHeight={roomInfo.mapSize[1]}
			user={false} userIndex={userIndex}/>
		<div class="test" style="left: {paddlePos[opponentIndex]}px; top: 50px;"></div>
		{#if puck}
		<PongPuck posX={(userIndex == UserType.Player1) ? roomInfo.mapSize[0] - puck.posX : puck.posX}
			posY={(userIndex == UserType.Player1) ? roomInfo.mapSize[1] - puck.posY : puck.posY} />
		{/if}
		<Paddle pos={paddlePos[userIndex]} paddleWidth={roomInfo.paddleSize}
			gameWidth={roomInfo.mapSize[0]} gameHeight={roomInfo.mapSize[1]}
			user={true} userIndex={userIndex}/>
		<div class="test" style="left: {paddlePos[userIndex]}px; top: {roomInfo.mapSize[1] - 50}px;
		"></div>

		{#if deathPoint && puck}
		<div class="deathPoint"
			style="left: {(puck.vectorY < 0) ? deathPoint : roomInfo.mapSize[0] - deathPoint - 30}px;
			top: {(puck.vectorY < 0 && userIndex || puck.vectorY > 0 && !userIndex) ? 50 : roomInfo.mapSize[1] - 50}px;"></div>
		{/if}
		<div class="central-line-vertical"></div>
		<div class="central-line-horizontal"></div>	
	</div>
	<!-- <div class="central-line"></div> -->
	<!-- <div class="pong-score">
		<ScoreBox score={scores[opponentIndex]}/>
		<ScoreBox score={scores[userIndex]}/>
	</div> -->
</div>

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

	$client.sock.send(JSON.stringify({
		event: "PaddleMove",
		data: {
			client: $client.id,
			player: userType,
			room: roomId,
			left: (userType == UserType.Player1 && event.code == 'KeyD'
				|| userType == UserType.Player2 && event.code == 'KeyA')
		}
	}));
}}

on:keyup={(event)=>{
	if (event.code != 'KeyA' && event.code != 'KeyD')
		return ;
	
	//* TODO some precision to make
	$client.sock.send(JSON.stringify({
		event: "PaddleStop",
		data: $client.id
	}));

	moving = false;
}}

/>