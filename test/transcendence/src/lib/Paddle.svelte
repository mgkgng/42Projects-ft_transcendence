<style lang="scss">
	.paddle {
		position: absolute;
		margin: 0;
		width: var(--paddleWidth);
		height: 12px;

		border-radius: 2em;

		left: var(--pos);
		z-index: 2;

		box-shadow: 0px 0px 20px 8px $yellow;


	}

	.user {
		margin: 0;
		box-shadow: 0px 0px 20px 8px $red;
	}


</style>

<script lang="ts">
	import { darkMode } from "$lib/stores/var";

	let dark : boolean;

	darkMode.subscribe(value => {
		dark = value;
	});

	export let user: boolean;
	export let gameWidth : number;
	export let gameHeight : number;
	export let paddleWidth : number;

	export let pos : number;

	let deadZoneHeight = 50;

	$: console.log(paddleWidth);

</script>

<div class="paddle {(user) ? "user" : ""}"
	style="{(dark) ? "background-color: #fff" : "background-color: #000"};
		top: {(!user) ? deadZoneHeight: gameHeight - deadZoneHeight}px;
		--pos: {(user) ? pos - paddleWidth / 2 : gameWidth - pos + paddleWidth / 2}px;
		--paddleWidth: {paddleWidth}px">
</div>

