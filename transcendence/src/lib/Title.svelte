<style lang="scss">

	.container {
		display: flex;
		align-items: center;
		justify-content: center;
		
		
	}
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

		// box-shadow: 0px 0px 240px 30px $main;
		// box-shadow: 0px 0px 550px 50px $main;
		box-shadow: 0px 0px 750px 100px $main;

	}

	@keyframes rotate {
		from { transform: rotate(var(--angle)) translateX(var(--dist)) rotate(var(--angle))}
		to { transform: rotate(var(--angle2)) translateX(var(--dist)) rotate(var(--angle2))}
	}

	@keyframes size-change {
		0% { transform: scale(1) }
		50% { transform: scale(1.3) }
		100% { transform: scale(1) }
	}

	.circle-around {
		position: absolute;
		top: var(--centerX);
		left: var(--centerY);
		width: var(--size);
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		background-color: #000;

		animation-name: rotate;
		animation-duration: var(--duration);
		animation-iteration-count: infinite;
		animation-timing-function: linear;
	}

	.title {
		position: absolute;
		top: 22vh;
		background-color: rgba(0, 0, 0, 0);
		margin: 2em;
		padding: .3em 0 .1em;
		font-size: 75px;
		text-align: center;
		color: white;
		user-select: none;
	}

	.color-change-circle {
		position: absolute;
		bottom: -40px;
		left: -40px;
		width: 80px;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		background-color: rgba(0, 0, 0, .95);
		// box-shadow: 0px 0px 50px 10px #000;
		cursor: pointer;

		animation-name: size-change;
		animation-duration: 3.5s;
		animation-iteration-count: infinite;
		animation-timing-function: linear;
	}

</style>

<script lang="ts">
	import { onMount } from "svelte";
	import RoundButton from "./RoundButton.svelte";
	import '$lib/scss/app.scss';

	export let topMargin;
	export let leftMargin;

	let circlesAround = [];
	let circleRadius = 250;

	let white = false;

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
		let circleNb = Math.floor(Math.random() * 10 + 15);

		for (let i = 0; i < circleNb; i++) {
			let circle = {};

			circle["size"] = Math.floor(Math.random() * 20 + 8).toString();
			circle["duration"] = Math.floor(Math.random() * 50 + 15).toString();
			circle["angle"] = Math.floor(Math.random() * 360);
			res.push(circle);
		}
		return (res)
	}

	onMount(() => {
		circlesAround = createCircles();
	});

</script>

<div class="container">
	<div class="main-circle" style="--startX: {topMargin}px; --startY: {leftMargin}px; --width: {circleRadius * 2}px">
	</div>
	{#each circlesAround as circleInfo}
	<div class="circle-around" style="--dist: {circleRadius + 45}px; --centerX: {centerX}px; --centerY: {centerY}px;  --startY: {circleInfo.y}px; --size: {circleInfo.size}px; --duration: {circleInfo.duration}s; --angle: {circleInfo.angle}deg; --angle2: {circleInfo.angle + 360}deg"></div>
	{/each}
	<RoundButton topMargin={topMargin} leftMargin={leftMargin} circleRadius={circleRadius}/>
	<h1 class="title">transcendence</h1>

	<div class="color-change-circle"></div>
</div>	