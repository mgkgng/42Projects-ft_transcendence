<style lang="scss">
	.container {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.game-container {
		width: var(--gameWidth);
		height: var(--gameHeight);
		padding: 0;
		border: solid transparentize(#000, .3);
		border-radius: 1em;
		display: grid;
		grid-template-rows: 2% 3% 90% 3% 2%;
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
		top: 400px;
		width: 500px;
		height: 0;
		border: dashed 3px rgba(0, 0, 0, .7);
	}

	.beyond-above {
		background-color: transparentize(blue, 0.7);
		border-radius: 1em 0;
	}

	.beyond-below {
		background-color: transparentize(blue, 0.7);
		border-radius: 0 1em;
	}

	.map {

	}
</style>

<script>
	import { io } from "socket.io-client";
	import Paddle from "$lib/Paddle.svelte";

	let gameWidth = 720;
	let gameHeight = 800;
</script>

<div class="container">
	<div class="game-container" style="--gameWidth: {gameWidth}px; --gameHeight: {gameHeight}px;">
		<div class="beyond-above"></div>
		<div class="bar-container-above">
			<Paddle gameWidth={gameWidth} gameHeight={gameHeight}/>
		</div>
		<div class="map"></div>
		<div class="bar-container-below">
			<Paddle gameWidth={gameWidth} gameHeight={gameHeight}/>
		</div>
		<div class="beyond-below"></div>
	</div>
	<div class="central-line"></div>
</div>
