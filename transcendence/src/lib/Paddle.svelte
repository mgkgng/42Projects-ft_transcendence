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

<script lang="ts">
	import { io } from "socket.io-client";


	export let myPaddle;
	export let gameWidth;
	export let gameHeight;

	let grapped = false;
	let moving = 0;

	let paddleWidth = 80;

	let pos = (gameWidth - paddleWidth) / 2;

	let callBack : Function;

	// $: console.log(moving);
	// $: console.log(pos);

	function movePaddle() {
		if (moving == 1)
			pos++;
		if (moving == -1)
			pos--;
	}

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
	if (!callBack && event.code == 'KeyA') {
		callBack = setInterval(() => {
			pos -= 10;
		}, 20);
	}
	if (!callBack && event.code == 'KeyD') {
		callBack = setInterval(() => {
			pos += 10;
		}, 20);
	}
}}

on:keyup={(event)=>{
	if (callBack) {
		clearInterval(callBack);
		setTimeout(callBack, 200);
		callBack = undefined;
	}
}}

/>