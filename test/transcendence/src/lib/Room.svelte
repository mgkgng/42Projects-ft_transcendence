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

	.central-line {
		position: absolute;
		top: 50%;
		width: 500px;
		height: 0;
		border: dashed 3px transparentize($main, 0.7);
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
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import DarkMode from "$lib/DarkMode.svelte";
	import { client } from "$lib/stores/client";
	import { UserType } from './stores/var';
	import Paddle from './Paddle.svelte';
    import { Pong } from './pong/Pong';
	import { Puck } from './pong/Puck';
    import { identity } from 'svelte/internal';
    import PongPuck from './PongPuck.svelte';
    import ScoreBox from './ScoreBox.svelte';

	export let roomInfo: any;
	export let roomId: string;

	// let gameMap = new GameMap(mapWidth.Small, mapHeight.Small, PaddleSize.Medium);

	// TODO GameMap info should go into the pong's constructor
	let pong = new Pong();
	let puck: any = undefined;
	let scores: Array<number> = [0, 0];

	let userType: number;
	let userIndex: number = 0;
	let opponentIndex: number = 1;

	let grapped = false;

	let moving = false;
	
	let puckMoving: any;

	$: console.log("My Paddle Position: ", pong.paddlePos[userIndex]);

	onMount(()=> {
		userType = ($client.id == roomInfo.players[0]) ? UserType.Player1 
			: ($client.id == roomInfo.players[1]) ? UserType.Player2 
			: UserType.Watcher;
		if (userType == UserType.Player2)
			[userIndex, opponentIndex] = [opponentIndex, userIndex];

		scores = roomInfo.scores;

		$client.addListener("PaddleUpdate", (data: any) => {
			// console.log("PaddleUpdate");
			pong.paddlePos[data.player] = data.paddlePos;
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
 
		$client.addListener("ScoreUpdate", (data: any) => {
			console.log("ScoreUpdate", data);
			clearInterval(puckMoving);
			scores[data]++;
		});

		return (() => {
			$client.removeListener("PaddleUpdate");
			$client.removeListener("ScoreUpdate");
			$client.removeListener("PongStart");
		})
	});

</script>

<div class="container">
	<div class="pong" style="width: {pong.gameMap.width}px; height: {pong.gameMap.height}px;">
		<Paddle pos={pong.paddlePos[opponentIndex]} paddleWidth={pong.gameMap.paddleSize}
			gameWidth={pong.gameMap.width} gameHeight={pong.gameMap.height}
			user={false}/>
		{#if puck}
		<PongPuck posX={puck.posX} posY={puck.posY}/>
		{/if}
		<Paddle pos={pong.paddlePos[userIndex]} paddleWidth={pong.gameMap.paddleSize}
			gameWidth={pong.gameMap.width} gameHeight={pong.gameMap.height}
			user={true}/>
	</div>
	<!-- <div class="central-line"></div> -->
	<div class="pong-score">
		<ScoreBox score={scores[opponentIndex]}/>
		<ScoreBox score={scores[userIndex]}/>
	</div>
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
			left: (event.code == 'KeyA')
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