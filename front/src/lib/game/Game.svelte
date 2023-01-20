<style lang="scss">

// 	@property --rotate {
//   syntax: "<angle>";
//   initial-value: 132deg;
//   inherits: false;
// }

	// .card {
	// 	background: #191c29;
	// 	width: var(--card-width);
	// 	height: var(--card-height);
	// 	padding: 3px;
	// 	position: relative;
	// 	border-radius: 6px;
	// 	justify-content: center;
	// 	align-items: center;
	// 	text-align: center;
	// 	display: flex;
	// 	font-size: 1.5em;
	// 	color: rgb(88 199 250 / 0%);
	// 	cursor: pointer;
	// 	font-family: cursive;
	// }

	// .card::before {
	// 	content: "";
	// 	width: 104%;
	// 	height: 102%;
	// 	border-radius: 8px;
	// 	background-image: linear-gradient(
	// 		var(--rotate)
	// 		, #5ddcff, #3c67e3 43%, #4e00c2);
	// 		position: absolute;
	// 		z-index: -1;
	// 		top: -1%;
	// 		left: -2%;
	// 		animation: spin 2.5s linear infinite;
	// }

	// .card::after {
	// 	position: absolute;
	// 	content: "";
	// 	top: calc(var(--card-height) / 6);
	// 	left: 0;
	// 	right: 0;
	// 	z-index: -1;
	// 	height: 100%;
	// 	width: 100%;
	// 	margin: 0 auto;
	// 	transform: scale(0.8);
	// 	filter: blur(calc(var(--card-height) / 6));
	// 	background-image: linear-gradient(
	// 		var(--rotate)
	// 		, #5ddcff, #3c67e3 43%, #4e00c2);
	// 		opacity: 1;
	// 	transition: opacity .5s;
	// 	animation: spin 2.5s linear infinite;
	// }

	// @keyframes spin {
	// 	0% { --rotate: 0deg; }
	// 	100% { --rotate: 360deg; }
	// }

	
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import Paddle from '$lib/game/Paddle.svelte';
    import PPuck from '$lib/game/PPuck.svelte';
	import { UserType, MapSize, PaddleSize,  } from '$lib/stores/var';
    import { client } from '../stores/client';

	export let player1: any;
	export let player2: any;
	export let gameInfo: any;
	export let switched: boolean;
	export let roomID: string;
	export let userType: number;

	export let puck: any;
	

	onMount(() => {
	})
</script>



