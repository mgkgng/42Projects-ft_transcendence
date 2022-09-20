<style lang="scss">
	.main-circle {
		position: absolute;
		top: var(--startX); // should make it responsive later
		left: var(--startY);
		width: var(--width);
		background-color: #000;
		aspect-ratio: 1 / 1;
		border-radius: 50%;

		display: flex;
		justify-content: center;
		align-items: center;

	}

	@keyframes rotateR {
		from { transform: rotate(var(--angle)) translateX(var(--startX)) rotate(var(--angle));}
		to { transform: rotate(var(--contreangle)) translateX(var(--startX)) rotate(var(--contreangle)); }
	}

	@keyframes rotateL {
		from { transform: rotate(360deg) translateX(var(--startX)) rotate(360deg);}
		to { transform: rotate(0deg) translateX(var(--startX)) rotate(0deg); }
	}

	.circle-around {
		position: absolute;
		top: var(--centerX);
		left: var(--centerY);
		width: var(--size);
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		background-color: #000;

		transform: rotate(90deg) translateX(var(--startX));

		animation-name: rotateR;
		animation-duration: var(--speed);
		animation-iteration-count: infinite;
		animation-timing-function: linear;

	}

	.title {
		background-color: $background;
		margin: 2em;
		padding: .3em 0 .1em;
		font-size: 75px;
		text-align: center;
		color: black;
	}
</style>

<script lang="ts">
	import { onMount } from "svelte";

	export let topMargin;
	export let leftMargin;

	let circlesAround = [];
	let circleRadius = 250;

	let centerX = topMargin + circleRadius;
	let centerY = leftMargin + circleRadius;

	$: console.log(circlesAround);

	function makeCssStyleVars(obj) {
		return (Object.entries(obj)
		.map(([key, value]) => `${key}:${value}`)
		.join(';'));
	}

	function createCircles() {
		let res = [];
		let circleNb = Math.floor(Math.random() * 10 + 32);

		for (let i = 0; i < circleNb; i++) {
			let circle = {};

			let angle = Math.floor(Math.random() * 360);

			let distCenterX = circleRadius * Math.sin(Math.PI * 2 * angle / 360);
			let distCenterY = circleRadius * Math.cos(Math.PI * 2 * angle / 360);

			let size = Math.floor(Math.random() * 20 + 8);

			circle["x"] = circleRadius + 45;
			circle["y"] = circleRadius;
			// circle["x"] = topMargin + circleRadius + distCenterX;
			// circle["y"] = leftMargin + circleRadius + distCenterY;
			// circle["x"] += !(angle > 0 && angle < 180) ? (size + 5) * -1: 5;
			// circle["y"] += (angle > 90 && angle < 270) ? (size + 5) * -1: 5;
			circle["size"] = size;
			circle["duration"] = Math.floor(Math.random() * 25 + 8).toString();
			circle["angle"] = angle.toString();
			
			// circle["rotateDir"] = Math.floor(Math.random() * 2).toString();
			res.push(circle);
		}
		return (res)
	}

	onMount(() => {
		circlesAround = createCircles();
	});

</script>

<div>
	<div class="main-circle" style="--startX: {topMargin}px; --startY: {leftMargin}px; --width: {circleRadius * 2}px">
		<h1 class="title">ft_transcendence</h1>
	</div>
	{#each circlesAround as circleInfo}
	<div class="circle-around" style="--radius: {circleRadius}px; --centerX: {centerX}px; --centerY: {centerY}px; --startX: {circleInfo.x}px; --startY: {circleInfo.y}px; --size: {circleInfo.size}px; --speed: {circleInfo.duration}s; --angle: {circleInfo.angle}deg; --contreangle: {360 - circleInfo.angle}deg"></div>
	{/each}
</div>	