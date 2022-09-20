<style lang="scss">

	@keyframes rotate {	
		from { transform: rotate(360deg) translateX(300px) rotate(-360deg); }
		to { transform: rotate(0deg) translateX(300px) rotate(0deg); }
	}

	.circle-button {
		position: absolute;
		top: var(--startX);
		left: var(--startY);

		background-color: #000;
		width: 100px;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		padding-bottom: .3em;

		display: flex;
		justify-content: center;
		align-items: center;

		animation-name: rotate;
		animation-duration: 36s;
		animation-iteration-count: infinite;
		animation-timing-function: linear;

		cursor: pointer;

		h2 {
			background-color: rgba(0, 0, 0, 0);
			font-family: 'modernism-narrow';
			color: white;
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
	// export let type;
	export let topMargin;
	export let leftMargin;
	export let circleRadius;

	let centerX = topMargin + circleRadius;
	let centerY = leftMargin + circleRadius;

	let startAngle;

	onMount(() => {
		startAngle = Math.floor(Math.random() * 360);
	});

</script>

<div>
	<div class="circle-button" style="--startX: {centerX - 45}px; --startY: {centerY}px; --angle: {startAngle}deg; --angle2: {startAngle + 360}deg">
		<h2>Login</h2>
	</div>
</div>

