<style lang="scss">
	.paddle {
		position: absolute;
		margin: 0;
		height: 12px;
		background-color: #fff;

		border-radius: 2em;

		z-index: 2;

		box-shadow: 0px 0px 20px 8px $red;
	}

	.absent {
		background-color: rgb(90, 84, 84);
		box-shadow: none;
	}

	.user {
		margin: 0;
		box-shadow: 0px 0px 20px 8px $blue;
	}
</style>

<script lang="ts">
	import { darkMode } from "$lib/stores/var";

	let dark : boolean;

	darkMode.subscribe(value => {
		dark = value;
	});

	export let user: boolean;
	export let userIndex: number;

	export let gameWidth : number;
	export let gameHeight : number;
	export let paddleWidth : number;

	export let pos : number;
	export let userPresent: boolean;

	let deadZoneHeight = 50;

	$: console.log(paddleWidth);
</script>

<div class="paddle {(user) ? "user" : ""} {(!userPresent) ? "absent" : ""}"
	style="top: {(!user) ? deadZoneHeight: gameHeight - deadZoneHeight}px;
		left: {((user && !userIndex) || (!userIndex && !user)) ? pos - paddleWidth : pos}px;
		width: {paddleWidth}px">
</div>