<style lang="scss">
	.paddle {
		width: 80px;
		height: 12px;
		box-shadow: 0px 0px 20px 8px $main;

		border-radius: 2em;

		position: relative;
		left: var(--pos);
	}
</style>

<script lang="ts">
	import { io } from "socket.io-client";
	import { darkMode } from "$lib/stores/var";

	let dark : boolean;

	darkMode.subscribe(value => {
		dark = value;
	});

	export let gameWidth : number;
	export let gameHeight : number;
	export let paddleWidth : number;

	export let pos : number;

</script>

<div class="paddle" style="{(dark) ? "background-color: #000" : "background-color: #fff"}; --pos: {pos}px; --paddleWidth = {paddleWidth}px"></div>

