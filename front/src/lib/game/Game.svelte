<style lang="scss">
	.pong-game {
		position: relative;

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
	export let initPos: number;
	export let roomID: string;
	export let userType: number;

	export let puck: any;

	let game: any;
	let gameSize: any;

	let prevY: number = initPos;


	onMount(() => {
		game = document.getElementById("game");
		gameSize = game?.getBoundingClientRect();

		console.log(game);
		console.log(gameSize);
	});
</script>

<div id="game" class="pong-game" style="min-width: {MapSize[gameInfo.mapSize][1]}px; min-height: {MapSize[gameInfo.mapSize][0]}px;">
	<Paddle pos={(!switched) ? player2?.pos : player1?.pos} paddleWidth={PaddleSize[gameInfo.paddleSize]}
		mapSize={MapSize[gameInfo.mapSize]}
		switched={switched}
		playerType={(!switched) ? 2 : 1}
		user={(!switched) ? player2 : player1}
		initPos={initPos}/>
	{#if puck}
	<PPuck pos={[(!switched) ? MapSize[gameInfo.mapSize][0] - puck.pos[0] : puck.pos[0],
		(!switched) ? MapSize[gameInfo.mapSize][1] - puck.pos[1] : puck.pos[1]]} />
	{/if}
	<Paddle pos={(!switched) ? player1?.pos : player2?.pos} paddleWidth={PaddleSize[gameInfo.paddleSize]}
		mapSize={MapSize[gameInfo.mapSize]}
		switched={switched}
		playerType={(!switched) ? 1 : 2}
		user={(!switched) ? player1 : player2}
		initPos={initPos}/>;
</div>

<svelte:window
	on:mousemove={(event) => {
		let pos = Math.floor(event.clientY - gameSize.y) - PaddleSize[gameInfo.paddleSize] / 2;
		if (pos < 0)
			pos = 0;
		if (pos > gameSize.height - PaddleSize[gameInfo.paddleSize])
			pos = gameSize.height - PaddleSize[gameInfo.paddleSize];

		if (pos == prevY)
			return ;
		prevY = pos;

		$client.socket.emit("PaddleMoveMouse", {
			pos: (!switched) ? pos : gameSize.height - pos - PaddleSize[gameInfo.paddleSize],
			roomID: roomID
		});
	}}
/>