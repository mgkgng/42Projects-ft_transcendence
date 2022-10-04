<style>
	.div-container {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.game-container {
		width: 300px;
		height: 80px;
		border:  black;
		
	}

	.central-line {
		position: absolute;
		top: 400px;
		width: 500px;
		height: 0;
		border: dashed 3px rgba(0, 0, 0, .7);
	}
</style>

<script>
	import { io } from "socket.io-client";
	import Bar from "$lib/Bar.svelte";

	let moving = 0;

	$: console.log(moving);

</script>

<div class="div-container">
	<div class="game-container">
		
	</div>

	<div class="central-line"></div>
	<Bar />

</div>

<svelte:window on:keydown={
	(e) => {
		if (e.code == 'KeyA')
			moving = -1;
		if (e.code == 'KeyD')
			moving = 1;
	}} on:keyup={()=>{
		moving = 0;
	}}
/>