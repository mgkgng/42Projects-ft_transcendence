<style lang="scss">

// 	@property --rotate {
//   syntax: "<angle>";
//   initial-value: 132deg;
//   inherits: false;
// }
	.pong-game {
		position: relative;
		height: 100%;
		width: 100%;

		padding: 0;
		border-radius: .5em;

		background-color: #212121;
	}

	// .card {
	// 	background: #191c29;
	// 	width: var(--card-width);
	// 	height: var(--card-height);
	// 	padding: 3px;
	// 	position: relative;
	// 	border-radius: 6px;
	// 	justify-content: center;
	// 	align-items: center;
	// 	text-align: center;
	// 	display: flex;
	// 	font-size: 1.5em;
	// 	color: rgb(88 199 250 / 0%);
	// 	cursor: pointer;
	// 	font-family: cursive;
	// }

	// .card::before {
	// 	content: "";
	// 	width: 104%;
	// 	height: 102%;
	// 	border-radius: 8px;
	// 	background-image: linear-gradient(
	// 		var(--rotate)
	// 		, #5ddcff, #3c67e3 43%, #4e00c2);
	// 		position: absolute;
	// 		z-index: -1;
	// 		top: -1%;
	// 		left: -2%;
	// 		animation: spin 2.5s linear infinite;
	// }

	// .card::after {
	// 	position: absolute;
	// 	content: "";
	// 	top: calc(var(--card-height) / 6);
	// 	left: 0;
	// 	right: 0;
	// 	z-index: -1;
	// 	height: 100%;
	// 	width: 100%;
	// 	margin: 0 auto;
	// 	transform: scale(0.8);
	// 	filter: blur(calc(var(--card-height) / 6));
	// 	background-image: linear-gradient(
	// 		var(--rotate)
	// 		, #5ddcff, #3c67e3 43%, #4e00c2);
	// 		opacity: 1;
	// 	transition: opacity .5s;
	// 	animation: spin 2.5s linear infinite;
	// }

	// @keyframes spin {
	// 	0% { --rotate: 0deg; }
	// 	100% { --rotate: 360deg; }
	// }

	.zone-limit {
		position: absolute;
		width: 1px;
		height: 100%;
	}

	.left {
		left: 0;
		// box-shadow: 1px 0px 120px 50px rgba(0,255,255,0.5), 
        //       2px 0px 4px rgba(0,255,255,0.5), 
        //       4px 0px 8px rgba(0,255,255,0.5), 
        //       var(--shadow);
	}

	.right {
		right: 0;
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import Paddle from '$lib/game/Paddle.svelte';
    import PPuck from '$lib/game/PPuck.svelte';
	import { UserType, MapSize, PaddleSize, PongConfig } from '$lib/stores/var';
    import { client } from '../stores/client';

	export let player1: any;
	export let player2: any;
	export let gameInfo: any;
	export let switched: boolean;
	export let roomID: string;
	export let userType: number;

	export let puck: any;
	let game: any = document.getElementById("game");
	let gameSize: any = game?.getBoundingClientRect();
	let paddleWidth: number;
	let initPos: number;
	let posHorizontal: Array<number>;
	let prevY: number = 0;

	$: puckPos = translatePucks(puck);

	function convertPixelWithHeight(where: number) {
		return (Math.floor((gameSize.height * where) / MapSize[gameInfo.mapSize][0]));
	}

	function convertPixelWithWidth(where: number) {
		return (Math.floor((gameSize.width * where) / MapSize[gameInfo.mapSize][1]));
	}

	function convertFromPixelWithHeight(pixel: number) {
		return (Math.floor((pixel * MapSize[gameInfo.mapSize][0]) / gameSize.height));
	}

	function defineValues() {
		paddleWidth = convertPixelWithHeight(PaddleSize[gameInfo.paddleSize]);
		initPos = convertPixelWithHeight((MapSize[gameInfo?.mapSize][0] - PaddleSize[gameInfo?.paddleSize]) / 2);
		posHorizontal = [convertPixelWithWidth(PongConfig.DeadZoneHeight), convertPixelWithWidth(MapSize[gameInfo.mapSize][1] - PongConfig.DeadZoneHeight - PongConfig.PaddleHeight / 2)];
	}

	function translatePucks(puck: any) {
		if (!puck)
			return ;
		let res = [];
		for (let pos of puck.pos) {
			res.push([(!switched) ? convertPixelWithHeight(pos[0]) : convertPixelWithHeight(MapSize[gameInfo.mapSize][0] - pos[0]),
			(!switched) ? convertPixelWithWidth(MapSize[gameInfo.mapSize][1] - pos[1]) : convertPixelWithWidth(pos[1])]);
		}
		console.log("testing: ", res);
		return (res);
	}

	window.addEventListener('resize', () => {
		game = document.getElementById("game");
		gameSize = game?.getBoundingClientRect();
		defineValues();
		console.log(gameSize);
		console.log(MapSize[gameInfo.mapSize]);
	});

	onMount(() => {
		game = document.getElementById("game");
		gameSize = game?.getBoundingClientRect();
		defineValues();
	})
</script>

<div id="game" class="pong-game">
	{#if gameSize}
		<div class="zone-limit left {(!switched) ? "player2" : "player1"}" style="--shadow: {convertPixelWithWidth(PongConfig.DeadZoneHeight)}px 0px 16px aqua"></div>
		<Paddle pos={(!switched) ? convertPixelWithHeight(player2?.pos) : convertPixelWithHeight(MapSize[gameInfo.mapSize][0] - player1?.pos - PaddleSize[gameInfo.paddleSize])} paddleWidth={paddleWidth}
			mapSize={MapSize[gameInfo.mapSize]}
			switched={switched}
			playerType={(!switched) ? 2 : 1}
			left={posHorizontal[0]}
			user={(!switched) ? player2 : player1}
			initPos={initPos}
			gameSize={gameSize}
			gameInfo={gameInfo}
			/>
		{#if puckPos}
		<PPuck pucks={puckPos} />
		{/if}
		<Paddle pos={(!switched) ? convertPixelWithHeight(player1?.pos) : convertPixelWithHeight(MapSize[gameInfo.mapSize][0] - player2?.pos - PaddleSize[gameInfo.paddleSize])} paddleWidth={paddleWidth}
			mapSize={MapSize[gameInfo.mapSize]}
			switched={switched}
			playerType={(!switched) ? 1 : 2}
			left={posHorizontal[1]}
			user={(!switched) ? player1 : player2}
			initPos={initPos}
			gameSize={gameSize}
			gameInfo={gameInfo}
			/>
		<div class="zone-limit right {(!switched) ? "player1" : "player2"}" style="--width: {convertPixelWithWidth(PongConfig.DeadZoneHeight)}px"></div>
	{/if}
</div>

<svelte:window
	on:mousemove={(event) => {
		let pos = Math.floor(event.clientY - gameSize.y) - paddleWidth / 2;
		if (pos < 0)
			pos = 0;
		if (pos > gameSize.height - paddleWidth)
			pos = gameSize.height - paddleWidth;
		
		let posConverted = Math.floor(convertFromPixelWithHeight((!switched) ? pos : gameSize.height - pos - paddleWidth));
		if (posConverted == prevY)
			return ;
		prevY = posConverted;
		$client.socket.emit("PaddleMoveMouse", {
			pos: posConverted,
			roomID: roomID
		});
	}}
/>