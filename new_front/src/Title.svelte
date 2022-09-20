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

		box-shadow: 0px 0px 240px 30px #0ff;

	}

	@keyframes rotate {
		from { transform: rotate(var(--angle)) translateX(var(--dist)) rotate(var(--angle))}
		to { transform: rotate(var(--angle2)) translateX(var(--dist)) rotate(var(--angle2))}
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
		background-color: rgba(0, 0, 0, 0);
		margin: 2em;
		padding: .3em 0 .1em;
		font-size: 75px;
		text-align: center;
		color: white;
		user-select: none;
	}
</style>

<script lang="ts">
	import { onMount } from "svelte";
	import RoundButton from "./RoundButton.svelte";

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
		let circleNb = Math.floor(Math.random() * 10 + 15);

		for (let i = 0; i < circleNb; i++) {
			let circle = {};

			circle["size"] = Math.floor(Math.random() * 20 + 8).toString();
			circle["duration"] = Math.floor(Math.random() * 100 + 6500).toString();
			circle["angle"] = Math.floor(Math.random() * 360).toString();
			circle["rotateDir"] = (Math.floor(Math.random() * 2)) ? "rotateR" : "rotateL";
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
	<RoundButton topMargin={topMargin} leftMargin={leftMargin} circleRadius={circleRadius}/>
	{#each circlesAround as circleInfo}
	<div class="circle-around" style="--dist: {circleRadius + 45}px; --centerX: {centerX}px; --centerY: {centerY}px;  --startY: {circleInfo.y}px; --size: {circleInfo.size}px; --duration: {circleInfo.duration}s; --angle: {circleInfo.angle}deg; --angle2: {circleInfo.angle + 360}deg"></div>
	{/each}
</div>	