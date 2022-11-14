<style lang="scss">
	.paddle {
		position: absolute;
		margin: 0;
		width: 12px;
		background-color: #fff;

		border-radius: .2em;

		z-index: 2;

		// border: 5px solid $red;
		box-shadow: 0px 0px 5px 5px $red;
	}

	.absent {
		background-color: rgb(90, 84, 84);
		box-shadow: none;
	}

	.user {
		margin: 0;
		box-shadow: 0px 0px 5px 5px $blue;
	}
</style>

<script lang="ts">
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
	style="left: {(!user) ? deadZoneHeight: gameHeight - deadZoneHeight}px;
		top: {((user && !userIndex) || (!userIndex && !user)) ? pos - paddleWidth : pos}px;
		height: {paddleWidth}px">
</div>