<style lang="scss">
	.container {
		background-color: #fff;

		display: grid;
		grid-template-columns: 20% 70% ;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.game-container {
		width: 800px;
		height: 600px;
		padding: 2em;
		border: dashed 5px white;

		display: flex;
		justify-content: center;
		align-items: center;
	}

	.game {
		position: relative;
		display: grid;
		grid-template-rows: 4% 3% 80% 3% 4%;
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
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import DarkMode from "$lib/DarkMode.svelte";
	import { client } from "$lib/stores/client";
	import { UserType } from './stores/var';
	import Paddle from './Paddle.svelte';
    import { Pong } from './pong/Pong';

	export let roomInfo: any;

	// let gameMap = new GameMap(mapWidth.Small, mapHeight.Small, PaddleSize.Medium);

	let pong = new Pong();

	let userIndex: number;

	let grapped = false;

	onMount(()=> {
		userIndex = ($client.id == roomInfo.players[0]) ? UserType.Player1 
			: ($client.id == roomInfo.players[1]) ? UserType.Player2 
			: UserType.Watcher;

		$client.addListener("PaddleUpdate", () => {

		});

		$client.addListener("GameUpdate", () => {

		});
	});

</script>

<div class="container">
	<div class="game-container" >
		<div class="game" style="width: {pong.gameMap.width}px; height: {pong.gameMap.height}px;">
			<div class="beyond-above"></div>
			<div class="bar-container-above">
				<Paddle pos={pong.paddlePos[0]} paddleWidth={pong.gameMap.paddleSize} gameWidth={pong.gameMap.width} gameHeight={pong.gameMap.height} />
			</div>
			<div class="map">
				<div class="main-circle "></div>
			</div>
			<div class="bar-container-below">
				<Paddle pos={pong.paddlePos[1]} paddleWidth={pong.gameMap.paddleSize} gameWidth={pong.gameMap.width} gameHeight={pong.gameMap.height} />
			</div>
			<div class="beyond-below"></div>
		</div>
	</div>
	<div class="central-line"></div>
</div>

<svelte:window
on:mouseup={()=>{
	grapped = false;
}}

on:mousemove={(event)=>{
	if (grapped)
		console.log(event);
}}

on:keydown={(event) => {
	if (!callBack && event.code == 'KeyA') {
		callBack = setInterval(() => {
			myPos -= 10;
		}, 20);
		// i should here send data to back
	}
	if (!callBack && event.code == 'KeyD') {
		callBack = setInterval(() => {
			myPos += 10;
		}, 20);
		// i should here send data to back
	}
}}

on:keyup={(event)=>{
	if (callBack) {
		clearInterval(callBack);
		// setTimeout(callBack, 200);
		callBack = undefined;
	}
}}

/>