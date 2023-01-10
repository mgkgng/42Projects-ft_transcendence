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
		initPos = (gameSize?.width - paddleWidth) / 2;
		posHorizontal = [convertPixelWithWidth(PongConfig.DeadZoneHeight), convertPixelWithWidth(MapSize[gameInfo.mapSize][1] - PongConfig.DeadZoneHeight - PongConfig.PaddleHeight)];
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
	<Paddle pos={(!switched) ? convertPixelWithHeight(player2?.pos) : convertPixelWithHeight(MapSize[gameInfo.mapSize][0] - player1?.pos - paddleWidth)} paddleWidth={paddleWidth}
		mapSize={MapSize[gameInfo.mapSize]}
		switched={switched}
		playerType={(!switched) ? 2 : 1}
		left={posHorizontal[0]}
		user={(!switched) ? player2 : player1}
		initPos={initPos}
		gameSize={gameSize}
		gameInfo={gameInfo}
		/>
	{#if puck}
	<PPuck pos={[(!switched) ? convertPixelWithWidth(puck.pos[0]) : convertPixelWithHeight(MapSize[gameInfo.mapSize][0] - puck.pos[0]),
		(!switched) ? convertPixelWithHeight(MapSize[gameInfo.mapSize][1] - puck.pos[1]) : convertPixelWithHeight(puck.pos[1])]} />
	{/if}
	<Paddle pos={(!switched) ? convertPixelWithHeight(player1?.pos) : convertPixelWithHeight(MapSize[gameInfo.mapSize][0] - player2?.pos - paddleWidth)} paddleWidth={paddleWidth}
		mapSize={MapSize[gameInfo.mapSize]}
		switched={switched}
		playerType={(!switched) ? 1 : 2}
		left={posHorizontal[1]}
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