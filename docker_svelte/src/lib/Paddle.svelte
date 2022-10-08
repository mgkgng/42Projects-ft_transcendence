<style lang="scss">
	.paddle {
		width: 80px;
		height: 12px;
		background-color: transparentize($main, 0.5);
		border-radius: 2em;

		position: relative;
		left: var(--pos);
	}
</style>

<script lang="ts">
	import { io } from "socket.io-client";

	export let gameWidth : number;
	export let gameHeight : number;
	export let paddleWidth : number;

	export let pos : number;


</script>

<div class="paddle" style="--pos: {pos}px; --paddleWidth = {paddleWidth}px"></div>

