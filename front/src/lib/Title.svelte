<style lang="scss">
	.container {
		position: relative;

		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 100%;

		min-width: 800px;

		button {
			font-size: 30px;
			position: absolute;
			top: 68%;
			left: 46%;

			text-align: center;
			align-items: center;

			width: 6em;
			height: 2em;
			border-radius: .3em;

			color: #e6e6e6;
			letter-spacing: 4px;
			border: solid 2.5px;

			background-color: #000;

			transition: .5s;
			cursor: pointer;

			&:hover {
				color: transparentize(#e6e6e6, 0.3);
				border-color: transparentize(#e6e6e6, .7);
				background-color: transparentize(#000, .8);
			}
		}
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
		background-color: transparentize($submain, .0);
		border: none;
		box-shadow: 0px 0px 5px 5px $submain; //maybe?

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

	.click-bg {
		position: absolute;
		top: 68%;
		left: 46%;
		width: 10.5em;
		height: 3.5em;
		border-radius: .5em;
		background: linear-gradient(90deg, $main 0%, #5610c6 60%, $submain 100%);
	}
	
	@media screen and (max-width: 950px) {
		.container {
			h1 { font-size: 60px; }
		}
	}
</style>

<script lang="ts">
	import { onMount } from "svelte";
    import { loginState } from "$lib/stores/var";
    import { goto } from "$app/navigation";
	import Modal from "$lib/tools/Modal.svelte";
	import MainCircle from '$lib/MainCircle.svelte';
    import PlayOrChat from "$lib/modals/PlayOrChat.svelte";
    import CreateGame from "$lib/modals/CreateGame.svelte";
    import EnterGame from "$lib/modals/EnterGame.svelte";
    import RoomList from "$lib/modals/RoomList.svelte";

	type Circle = {
		size: number;
		duration: number;
		angle: number;
	};

	let enterModal: any;
	let enterGameModal: any;
	let createGameModal: any;
	let roomListModal: any;

	export let title: string;

	let circlesAround: Array<Circle> = [];
	let circleRadius = 250;

	let blues: Array<Circle> = [];

	let message = "";

	let login: boolean;

	loginState.subscribe(value => { login = value; })

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

<Modal bind:this={createGameModal} closeOnBgClick={true}>
	<CreateGame itself={createGameModal} enterGameModal={enterGameModal}/>
</Modal>

<Modal bind:this={roomListModal} closeOnBgClick={true}>
	<RoomList itself={roomListModal} enterGameModal={enterGameModal}/>
</Modal>

<Modal bind:this={enterGameModal} closeOnBgClick={true}>
	<EnterGame itself={enterGameModal} createGameModal={createGameModal} roomListModal={roomListModal}/>
</Modal>

<Modal bind:this={enterModal} closeOnBgClick={true}>
	<PlayOrChat itself={enterModal} enterGameModal={enterGameModal}/>
</Modal>


<div class="container">
	{#each blues as blue}
	<div class="blue-circle-around" style="--dist: {circleRadius + 85}px; --size: {blue.size}px; --duration: {blue.duration}s; --angle: {blue.angle}deg; --angle2: {blue.angle + 360}deg"></div>
	{/each}

	<MainCircle circleRadius={circleRadius}/>

	{#each circlesAround as circleInfo}
	<div class="circle-around" style="--dist: {circleRadius + 85}px; --size: {circleInfo.size}px; --duration: {circleInfo.duration}s; --angle: {circleInfo.angle}deg; --angle2: {circleInfo.angle + 360}deg"></div>
	{/each}

	<div class="click-bg"></div>
	{#if !login}
	<button on:click={() => {
		goto("https://api.intra.42.fr/oauth/authorize?client_id=7e2bea32b8d407dab9d25b1ab4ff8ec14118a99e50807a191bc47334ed598658&redirect_uri=http%3A%2F%2Flocalhost%3A3002&response_type=code");
	}}>Login</button>
	{:else}
	<button on:click={() => {
		enterModal.open();
	}}>Enter</button>
	{/if}
	<h1 class="title">{title}</h1>
</div>