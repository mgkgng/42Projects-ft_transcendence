<style lang="scss">

</style>


	<!-- .button {
		width: 50px;
		height: 40px;
		background-color: red;
	}

	.circle-button {
		position: absolute;
		top: 40%;
		left: 43%;

		background-color: transparentize(#000000, 0.1);
		width: 100px;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		padding-bottom: .3em;

		display: flex;
		justify-content: center;
		align-items: center;

		animation-name: appear;
		animation-duration: 5s;
		animation-iteration-count: infinite;
		animation-timing-function: linear;

		cursor: pointer;

		h2 {
			background-color: rgba(0, 0, 0, 0);
			font-family: 'modernism-narrow';
			color: rgba(255, 255, 255, 0.85);
			user-select: none;
		}

		.h2:hover {
			transition: .2s;
			color: rgba(255, 255, 255, 0.9);
		}
	}

	.circle-button:hover {
		transition: .4s;
		background-color: transparentize($main, .8);
	}


</style> -->

<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import '$lib/scss/app.scss';
	import { client } from "./stores/client";
	import { loginState } from "./stores/var";

	export let circleRadius;
	export let showMessage;
	export let message;

	let angleRand;
	let angleLogin: Array<number> = [], anglePlay: Array<number> = [];


	$: console.log("login: ", login);

	onMount(() => {
		angleRand = Math.floor(Math.random() * 180 + 90);
		angleLogin = [angleRand, -angleRand, angleRand - 360, -angleRand + 360];
		anglePlay = [angleRand - 180, -angleRand + 180, angleRand - 540, -angleRand + 540];
	});

</script>



	<!-- <div class="circle-button" style="--from1: 0deg; --to1: 20deg;
	--from2: 0deg; --to2: 20deg"
		on:click={()=>{
			else {
				loginState.set(false);
				localStorage.removeItem("transcendence-jwt");
				goto('/');
			}
		}}>
		{#if !login}
		<h2>Login</h2>
		{:else}
		<h2>Logout</h2>
		{/if}
	</div>
	<div class="circle-button" style="--from1: {anglePlay[0]}deg; --to1: {anglePlay[1]}deg;
	--from2: {anglePlay[2]}deg; --to2: {anglePlay[3]}deg"
		on:click={()=>{
			if (!login) {
				showMessage = true;
				message = "Login required!";
			}
			$client.socket.emit("JoinQueue", { data: $client.id });
		}}
	>
		<h2>Play</h2>
	</div> -->

