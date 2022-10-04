<style lang="scss">
	.paddle {
		width: 80px;
		height: 12px;
		background-color: transparentize(blue, 0.5);
		border-radius: 2em;

		position: relative;
		left: var(--pos);
	}
</style>

<script>
	import { io } from "socket.io-client";

	export let gameWidth;
	export let gameHeight;

	let grapped = false;
	let moving = 0;

	let paddleWidth = 80;

	let pos = (gameWidth - paddleWidth) / 2;

	$: moving;
	$: pos + moving;
	
	$: console.log(pos);
</script>

<div class="paddle" style="--pos: {pos}px; --paddleWidth = {paddleWidth}px"></div>

<svelte:window
on:mouseup={()=>{
	grapped = false;
}}

on:mousemove={(event)=>{
	if (grapped)
		console.log(event);
}}

on:keydown={(event) => {
	// console.log(event);
	if (event.code == 'KeyA')
		moving = -1;
	if (event.code == 'KeyD')
		moving = 1;
}}

on:keyup={()=>{
	moving = 0;
}}

/>