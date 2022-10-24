<style lang="scss">
	.container {
		position: relative;

		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 100%;

		min-width: 800px;
	}

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
		background-color: transparentize($main2, .0);
		border: none;
		box-shadow: 0px 0px 5px 5px rgb(49, 211, 240); //maybe?

		animation-name: rotate-rev;
		animation-duration: var(--duration);
		animation-iteration-count: infinite;
		animation-timing-function: linear;
	}

	.title {
		position: absolute;
		z-index: 99;

		font-family: 'alpha-prota';
		background-color: rgba(0, 0, 0, 0);
		margin: 2em;
		padding: .3em 0 .1em;
		font-size: 75px;
		letter-spacing: 15px;
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

	.click {

		// font-family: 'alpha-porta';
		font-size: 30px;
		position: absolute;
		top: 65%;
		left: 46%;

		text-align: center;
		align-items: center;
		
		width: 6em;
		height: 2em;
		border-radius: 2.5em;

		color: #e6e6e6;
		border-bottom: solid;
		border: solid 2.5px;

		padding-top: .2em;
		
		transition: .5s;
		cursor: pointer;

		&:hover {
			color: transparentize(#e6e6e6, 0.4);
			border-color: transparentize(#e6e6e6, 0.4);
		}
	}

</style>

<script lang="ts">
	import { onMount } from "svelte";
	import RoundButton from "./RoundButton.svelte";
    import MainCircle from './MainCircle.svelte';

	type Circle = {
		size: number;
		duration: number;
		angle: number;
	};

	export let darkMode = false;
	export let title: string;
	export let mainPage: boolean;

	let circlesAround: Array<Circle> = [];
	let circleRadius = 250;

	let blues: Array<Circle> = [];

	let showMessage = false;
	let message = "";

	let showMenu: boolean = false;

	$: console.log(showMenu);

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

<div class="container">
	{#each blues as blue}
	<div class="blue-circle-around" style="--dist: {circleRadius + 85}px; --size: {blue.size}px; --duration: {blue.duration}s; --angle: {blue.angle}deg; --angle2: {blue.angle + 360}deg"></div>
	{/each}

	<MainCircle circleRadius={circleRadius}/>

	{#each circlesAround as circleInfo}
	<div class="circle-around" style="--dist: {circleRadius + 85}px; --size: {circleInfo.size}px; --duration: {circleInfo.duration}s; --angle: {circleInfo.angle}deg; --angle2: {circleInfo.angle + 360}deg"></div>
	{/each}

	<div class="click" on:click = {() => {
		showMenu = !showMenu;
	}}>play</div>
	{#if showMenu}
	<RoundButton
		bind:showMessage={showMessage}
		bind:message={message}
		circleRadius={circleRadius}/>
	{/if}
	<div class="msg">{message}</div>
	<h1 class="title">{title}</h1>
</div>

<!-- <svelte:window
on:mousemove={
	(e) => {
		showMenu = (e.pageX > 350 && e.pageX < 1350) ? true : false;
	}
}
/> -->
