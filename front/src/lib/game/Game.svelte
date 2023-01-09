<style lang="scss">
	.pong-game {
		position: relative;
		height: 100%;
		width: 100%;

		padding: 0;
		border-radius: .5em;

		background-color: #212121;
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import Paddle from '$lib/game/Paddle.svelte';
    import PPuck from '$lib/game/PPuck.svelte';
	import { UserType, MapSize, PaddleSize } from '$lib/stores/var';
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
	let prevY: number = 0;

	function convertPixelWithHeight(where: number) {
		console.log(gameSize);
		return ((gameSize.height * where) / MapSize[gameInfo.mapSize][1]);
	}

	function convertPixelWithWidth(where: number) {
		return ((gameSize.width * where) / MapSize[gameInfo.mapSize][0]);
	}

	function convertFromPixelWithHeight(pixel: number) {
		return ((pixel * MapSize[gameInfo.mapSize][1]) / gameSize.height);
	}

	function defineValues() {
		paddleWidth = convertPixelWithHeight(PaddleSize[gameInfo.paddleSize]);
		initPos = (gameSize?.width - paddleWidth) / 2;
	}

	window.addEventListener('resize', () => {
		game = document.getElementById("game");
		gameSize = game?.getBoundingClientRect();
		defineValues();
	});

	onMount(() => {
		game = document.getElementById("game");
		gameSize = game?.getBoundingClientRect();
		defineValues();
	})
</script>

<!-- <div id="game" class="pong-game" style="min-width: {MapSize[gameInfo.mapSize][1]}px; min-height: {MapSize[gameInfo.mapSize][0]}px;"> -->
<div id="game" class="pong-game">
	{#if gameSize}
	<Paddle pos={(!switched) ? convertPixelWithHeight(player2?.pos) : convertPixelWithHeight(MapSize[gameInfo.mapSize][0] - player1?.pos - PaddleSize[gameInfo.paddleSize])} paddleWidth={paddleWidth}
		mapSize={MapSize[gameInfo.mapSize]}
		switched={switched}
		playerType={(!switched) ? 2 : 1}
		user={(!switched) ? player2 : player1}
		initPos={initPos}
		gameSize={gameSize}
		gameInfo={gameInfo}
		/>
	{#if puck}
	<PPuck pos={[(!switched) ? convertPixelWithWidth(puck.pos[0]) : convertPixelWithHeight(MapSize[gameInfo.mapSize][0] - puck.pos[0]),
		(!switched) ? convertPixelWithHeight(MapSize[gameInfo.mapSize][1] - puck.pos[1]) : convertPixelWithHeight(puck.pos[1])]} />
	{/if}
	<Paddle pos={(!switched) ? convertPixelWithHeight(player1?.pos) : convertPixelWithHeight(MapSize[gameInfo.mapSize][0] - player2?.pos - PaddleSize[gameInfo.paddleSize])} paddleWidth={paddleWidth}
		mapSize={MapSize[gameInfo.mapSize]}
		switched={switched}
		playerType={(!switched) ? 1 : 2}
		user={(!switched) ? player1 : player2}
		initPos={initPos}
		gameSize={gameSize}
		gameInfo={gameInfo}
		/>;
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