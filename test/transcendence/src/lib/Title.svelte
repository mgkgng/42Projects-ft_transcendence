<style lang="scss">
	.container {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
	}

	@keyframes rotate {
		from { transform: rotate(var(--angle)) translateX(var(--dist)) rotate(var(--angle))}
		to { transform: rotate(var(--angle2)) translateX(var(--dist)) rotate(var(--angle2))}
	}

	.circle-around {
		position: absolute;
		top: 44%;
		left: 50%;
		right: 0;
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
		background-color: rgba(0, 0, 0, 0);
		margin: 2em;
		padding: .3em 0 .1em;
		font-size: 75px;
		text-align: center;
		color: white;
		user-select: none;
	}

	@keyframes show-msg {
		0% { color: #000 }
		50% { transform: #fff }
		100% { transform: #000 }
	}

	.msg {
		background-color:rgba(0, 0, 0, 0);

		animation-play-state: paused;
		animation-name: show-msg;
		animation-duration: 3s;

		// for play
		// animation-iteration-count: infinite;
		// animation-timing-function: linear;

		// for login required
		// animation-iterator-count: 1;
		// animation-timinig-function: ease-out;
	}

</style>

<script lang="ts">
	import { onMount } from "svelte";
	import RoundButton from "./RoundButton.svelte";
	import '$lib/scss/app.scss';
    import MainCircle from './MainCircle.svelte';

	type Circle = {
		size: number;
		duration: number;
		angle: number;
	};

	export let darkMode = false;

	let circlesAround: Array<Circle> = [];
	let circleRadius = 250;

	let showMessage = false;
	let message = "";

	function createCircles() {
		let res = [];
		let circleNb = Math.floor(Math.random() * 10 + 15);
		
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


	});

</script>

<div class="container">
	<MainCircle circleRadius={circleRadius}/>
	{#each circlesAround as circleInfo}
	<div class="circle-around" style="--dist: {circleRadius + 45}px; --size: {circleInfo.size}px; --duration: {circleInfo.duration}s; --angle: {circleInfo.angle}deg; --angle2: {circleInfo.angle + 360}deg"></div>
	{/each}
	<RoundButton bind:showMessage={showMessage} bind:message={message} circleRadius={circleRadius}/>
	<h1 class="title">transcendence</h1>
	<div class="msg">{message}</div>
</div>