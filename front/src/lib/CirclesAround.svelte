<style lang="scss">
	@keyframes rotate {
		from { transform: rotate(var(--angle)) translateX(var(--dist)) rotate(var(--angle))}
		to { transform: rotate(var(--angle2)) translateX(var(--dist)) rotate(var(--angle2))}
	}

	@keyframes rotate-rev {
		from { transform: rotate(var(--angle2)) translateX(var(--dist)) rotate(var(--angle2))}
		to { transform: rotate(var(--angle)) translateX(var(--dist)) rotate(var(--angle))}
	}

	.circle-around {
		position: absolute;
		// z-index: 88;
		top: 49%;
		left: 50%;
		right: 0;
		width: var(--size);
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		background-color: #000;

		animation-name: rotate-rev;
		animation-duration: var(--duration);
		animation-iteration-count: infinite;
		animation-timing-function: linear;
	}

	.blue-circle-around {
		position: absolute;
		top: 49%;
		left: 50%;
		right: 0;
		width: var(--size);
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		background-color: transparentize($submain, .0);
		border: none;
		box-shadow: 0px 0px 5px 5px $submain; //maybe?

		animation-name: rotate-rev;
		animation-duration: var(--duration);
		animation-iteration-count: infinite;
		animation-timing-function: linear;
	}
</style>

<script lang="ts">
    import { onMount } from "svelte";

	type Circle = {
		size: number;
		duration: number;
		angle: number;
	};

	export let circleRadius: number;

	let circlesAround: Array<Circle> = [];
	let blues: Array<Circle> = [];


	function createCircles() {
		let res = [];
		let circleNb = Math.floor(Math.random() * 10 + 10);
		
		for (let i = 0; i < circleNb; i++) {
			let circle: Circle = {
				size : Math.floor(Math.random() * 20 + 8),
				duration : Math.floor(Math.random() * 50 + 15),
				angle : Math.floor(Math.random() * 360)
			};
			res.push(circle);
		}
		return (res)
	}

	function createBlueCircles() {
		let res = [];
		let circleNb = Math.floor(Math.random() * 5 + 3);
		
		for (let i = 0; i < circleNb; i++) {
			let circle: Circle = {
				size : Math.floor(Math.random() * 20 + 8),
				duration : Math.floor(Math.random() * 50 + 15),
				angle : Math.floor(Math.random() * 360)
			};
			res.push(circle);
		}
		return (res)

	}

	onMount(() => {
		circlesAround = createCircles();
		blues = createBlueCircles();
	});
</script>

{#each blues as blue}
<div class="blue-circle-around" style="--dist: {circleRadius + 85}px; --size: {blue.size}px; --duration: {blue.duration}s; --angle: {blue.angle}deg; --angle2: {blue.angle + 360}deg"></div>
{/each}
{#each circlesAround as circleInfo}
<div class="circle-around" style="--dist: {circleRadius + 85}px; --size: {circleInfo.size}px; --duration: {circleInfo.duration}s; --angle: {circleInfo.angle}deg; --angle2: {circleInfo.angle + 360}deg"></div>
{/each}