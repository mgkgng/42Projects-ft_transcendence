<style lang="scss">
	.main-circle {
		position: absolute;
		top: 50px; // should make it responsive later
		left: 350px;
		background-color: #000;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
	}

	.circle-around {
		position: absolute;
		top: var(--startX);
		left: var(--startY);
		width: var(--size);
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		background-color: #000;
	}

	.title {
		position: absolute;
		top: 80px;
		left: 100px;
		background-color: $background;
		margin: 2em;
		padding: .4em 0 .2em;
		font-size: 75px;
		text-align: center;
	}
</style>

<script lang="ts">
	import { onMount } from "svelte";

	let circlesAround = [];
	let circleRadius = 250;
	let topMargin = 50;
	let leftMargin = 350;

	$: console.log(circlesAround);

	function makeCssStyleVars(obj) {
		return (Object.entries(obj)
		.map(([key, value]) => `${key}:${value}`)
		.join(';'));
	}

	function createCircles() {
		let res = [];
		let circleNb = Math.floor(Math.random() * 50 + 32);
	
		for (let i = 0; i < circleNb; i++) {
			let circle = {};
			let circleInfo = "";

			let angle = Math.floor(Math.random() * 360);

			let distCenterX = circleRadius * Math.sin(Math.PI * 2 * angle / 360);
			let distCenterY = circleRadius * Math.cos(Math.PI * 2 * angle / 360);

			let size = Math.floor(Math.random() * 15 + 8);

			circle["x"] = topMargin + circleRadius + distCenterX;
			circle["y"] = leftMargin + circleRadius + distCenterY;
			circle["x"] += !(angle > 0 && angle < 180) ? (size + 10) * -1: size;
			circle["y"] += (angle > 90 && angle < 270) ? (size + 10) * -1: size;
			circle["size"] = size;
			// circle["speed"] = Math.floor(Math.random() * 25 + 20).toString();
			// circle["rotateDir"] = Math.floor(Math.random() * 2).toString();
			// circleInfo = makeCssStyleVars(circle);
			res.push(circle);
		}
		return (res)
	}

	onMount(() => {
		circlesAround = createCircles();
		console.log("coucou", circlesAround);
	});
	
</script>

<main>
	<div class="main-circle" style="top: {topMargin}px; left: {leftMargin}; width: {circleRadius * 2}px"></div>

	{#each circlesAround as circleInfo}
	<div class="circle-around" style="--startX: {circleInfo.x}px; --startY: {circleInfo.y}px; --size: {circleInfo.size}px;"></div>
	{/each}
	<h1 class="title">ft_transcendence</h1>
	
</main>

