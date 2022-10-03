<style lang="scss">

	@keyframes rotate {	
		from { transform: rotate(var(--from1)) translateX(350px) rotate(var(--to1)); }
		to { transform: rotate(var(--from2)) translateX(350px) rotate(var(--to2)); }
	}

	.circle-button {
		position: absolute;
		top: 40%;
		left: 48%;

		background-color: transparentize(#000000, 0.1);
		width: 100px;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		padding-bottom: .3em;

		display: flex;
		justify-content: center;
		align-items: center;

		animation-name: rotate;
		animation-duration: 40s;
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


</style>

<script>
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import '$lib/scss/app.scss';

	export let topMargin;
	export let leftMargin;
	export let circleRadius;

	let centerX = topMargin + circleRadius;
	let centerY = leftMargin + circleRadius;

	let angleRand;
	let angleLogin = [], anglePlay = [];

	onMount(() => {
		angleRand = Math.floor(Math.random() * 180 + 90);
		angleLogin = [angleRand, -angleRand, angleRand - 360, -angleRand + 360];
		anglePlay = [angleRand - 180, -angleRand + 180, angleRand - 540, -angleRand + 540];
	});

</script>

<div>
	<div class="circle-button" style="--startX: {centerX - 50}px; --startY: {centerY - 50}px;
		--from1: {angleLogin[0]}deg; --to1: {angleLogin[1]}deg; --from2: {angleLogin[2]}deg; --to2: {angleLogin[3]}deg"
		on:click={()=>{ goto(`/login`); }}
	>
		<h2>Login</h2>
	</div>
	<div class="circle-button" style="--startX: {centerX - 50}px; --startY: {centerY - 50}px;
		--from1: {anglePlay[0]}deg; --to1: {anglePlay[1]}deg; --from2: {anglePlay[2]}deg; --to2: {anglePlay[3]}deg"
		on:click={()=>{ goto(`/play`); }}
	>
		<h2>Play</h2>
	</div>
</div>

