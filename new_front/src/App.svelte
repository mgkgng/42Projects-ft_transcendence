<style lang="scss">
	.main-circle {
		position: absolute;
		top: 50px; // should make it responsive later
		left: 350px;
		background-color: #000;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
	}

	@keyframes rotateR {
		from { transform: rotate(var(--angle)) translateX(var(--startX)) rotate(var(--angle));}
		to { transform: rotate(360deg) translateX(var(--startX)) rotate(360deg); }
	}

	@keyframes rotateL {
		from { transform: rotate(360deg) translateX(var(--startX)) rotate(360deg);}
		to { transform: rotate(0deg) translateX(var(--startX)) rotate(0deg); }
	}

	// .test-circle {
	// 	background-color: aqua;
	// 	width: 50px;
	// 	aspect-ratio: 1 / 1;
	// 	border-radius: 50%;
	// 	position: absolute;
	// 	top: var(--centerX);
	// 	left: var(--centerY);
	// }

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
		position: absolute;
		top: var(--centerX);
		left: var(--centerY);
		background-color: $background;
		margin: 2em;
		padding: .3em 0 .1em;
		font-size: 75px;
		text-align: center;
		color: #000;
	}
</style>

<script lang="ts">
	import { onMount } from "svelte";

	let circlesAround = [];
	let circleRadius = 250;
	let topMargin = 50;
	let leftMargin = 350;

	let centerX = 275;
	let centerY = 575;

	$: console.log(circlesAround);

	function makeCssStyleVars(obj) {
		return (Object.entries(obj)
		.map(([key, value]) => `${key}:${value}`)
		.join(';'));
	}

	function createCircles() {
		let res = [];
		let circleNb = Math.floor(Math.random() * 10 + 15);
	
		for (let i = 0; i < circleNb; i++) {
			let circle = {};

			let angle = Math.floor(Math.random() * 360);

			let distCenterX = circleRadius * Math.sin(Math.PI * 2 * angle / 360);
			let distCenterY = circleRadius * Math.cos(Math.PI * 2 * angle / 360);

			let size = Math.floor(Math.random() * 5 + 15);

			// circle["x"] = topMargin + circleRadius + distCenterX;
			// circle["y"] = leftMargin + circleRadius + distCenterY;
			circle["x"] = circleRadius + 30;
			circle["y"] = circleRadius;
			// circle["x"] += !(angle > 0 && angle < 180) ? (size + 25) * -1: 25;
			// circle["y"] += (angle > 90 && angle < 270) ? (size + 5) * -1: 5;
			circle["size"] = size;
			circle["speed"] = Math.floor(Math.random() * 30 + 8);
			circle["angle"] = angle.toString();
			circle["rotateDir"] = Math.floor(Math.random() * 2);
			res.push(circle);
		}
		return (res)
	}

	onMount(() => {
		circlesAround = createCircles();
	});
	
</script>

<main>
	<div class="main-circle" style="top: {topMargin}px; left: {leftMargin}; width: {circleRadius * 2}px"></div>

	<h1 class="title">ft_transcendence</h1>
	{#each circlesAround as circleInfo}
	<div class="circle-around" style="--radius: {circleRadius}px; --centerX: {centerX + 30}px; --centerY: {centerY + 10}px; --startX: {circleInfo.x}px; --startY: {circleInfo.y}px; --size: {circleInfo.size}px; --speed: {circleInfo.speed}s; --angle: {circleInfo.angle}deg;"></div>
	{/each}
	<!-- <div class="test-circle" style="--centerX: {centerX}px; --centerY: {centerY}px">test</div> -->
	
</main>

