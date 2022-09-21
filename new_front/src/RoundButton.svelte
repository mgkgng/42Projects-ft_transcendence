<style lang="scss">

	@keyframes rotate {	
		from { transform: rotate(360deg) translateX(350px) rotate(-360deg); }
		to { transform: rotate(0deg) translateX(350px) rotate(0deg); }
	}

	.circle-button {
		position: absolute;
		top: var(--startX);
		left: var(--startY);

		background-color: rgba(0, 0, 0, 0.9);
		width: 100px;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		padding-bottom: .3em;

		display: flex;
		justify-content: center;
		align-items: center;

		animation-name: rotate;
		animation-duration: 25s;
		animation-iteration-count: infinite;
		animation-timing-function: linear;

		cursor: pointer;

		h2 {
			background-color: rgba(0, 0, 0, 0);
			font-family: 'modernism-narrow';
			color: white;
			user-select: none;
		}
	}

	.circle-button:hover {
		transition: .4s;
		background-color: rgba(0, 255, 255, 0.2);
		animation-play-state: paused;
	}


</style>

<script>
	import { onMount } from "svelte";
	// import { goto } from '$app/navigation';


	export let topMargin;
	export let leftMargin;
	export let circleRadius;

	let centerX = topMargin + circleRadius;
	let centerY = leftMargin + circleRadius;

	let angleLogin, anglePlay;

	onMount(() => {
		angleLogin = Math.floor(Math.random() * 180 + 180);
		anglePlay = Math.floor(Math.random() * 180);
	});

</script>

<div>
	<div class="circle-button" style="--startX: {centerX - 50}px; --startY: {centerY - 50}px; --angle: {angleLogin}deg; --angle2: {angleLogin + 360}deg"
		on:click={()=>{
			console.log("Login");
		}}
	>
		<h2>Login</h2>
	</div>
	<div class="circle-button" style="--startX: {centerX - 50}px; --startY: {centerY - 50}px; --angle: {anglePlay}deg; --angle2: {anglePlay + 360}deg"
		on:click={()=>{
			console.log("Play");
		}}
	>
		<h2>Play</h2>
	</div>
</div>

