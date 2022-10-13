<style lang="scss">
	.paddle {
		width: 80px;
		height: 12px;

		border-radius: 2em;

		position: relative;
		left: var(--pos);

	}

	.user {
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

</script>

<div class="paddle {(user) ? "user" : ""}" style="{(dark) ? "background-color: #fff" : "background-color: #000"}; --pos: {pos}px; --paddleWidth = {paddleWidth}px"></div>

