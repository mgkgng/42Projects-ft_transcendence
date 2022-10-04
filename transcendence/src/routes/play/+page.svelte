<style lang="scss">
	.container {
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.game-container {
		width: var(--gameWidth);
		height: var(--gameHeight);
		padding: 0;
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
		top: 400px;
		width: 500px;
		height: 0;
		border: dashed 3px transparentize($main, 0.7);
	}

	.beyond-above {
		background-color: transparentize($main, 0.7);
		border-radius: 5em 5em 0 0;
	}

	.beyond-below {
		background-color: transparentize($main, 0.7);
		border-radius: 0 0 5em 5em;
	}

	.map {
		display: flex;
		background-color: transparentize($main, 0.9);
	}

	.main-circle {
		width: 100%;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		background-color: transparentize(#fff, 0.6)
	}
</style>

<script>
	import Paddle from "$lib/Paddle.svelte";

	let gameWidth = 720;
	let gameHeight = 800;

	let grapped = false;

	let callBack;

	let paddleWidth = 80;
	let oppoPos = (gameWidth - paddleWidth) / 2;
	let myPos = (gameWidth - paddleWidth) / 2;



</script>

<div class="container">
	<div class="game-container" style="--gameWidth: {gameWidth}px; --gameHeight: {gameHeight}px;">
		<div class="beyond-above"></div>
		<div class="bar-container-above">
			<Paddle pos={oppoPos} paddleWidth={paddleWidth} gameWidth={gameWidth} gameHeight={gameHeight} />
		</div>
		<div class="map">
			<div class="main-circle "></div>
		</div>
		<div class="bar-container-below">
			<Paddle pos={myPos} paddleWidth={paddleWidth} gameWidth={gameWidth} gameHeight={gameHeight} />
		</div>
		<div class="beyond-below"></div>
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