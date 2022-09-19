<style lang="scss">
	.main-circle {
		position: absolute;
		top: 10vh;
		left: 35vw;
		background-color: #000;
		width: 50vh;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
	}

	.title {
		position: absolute;
		top: 12vh;
		left: 22vw;
		background-color: $background;
		margin: 2em;
		padding: .4em 0 .2em;
		font-size: 75px;
		text-align: center;
}
</style>

<script lang="ts">
	import { onMount } from "svelte/types/runtime/internal/lifecycle";

	let circlesAround;

	function createCircles() {
		let circleInfos = [];
		let circleNb = Math.floor(Math.random() * 16 + 12);
		
		for (let i = 0; i < circleNb; i++) {
			let circle = {};
			// circle["startX"] =
			// circle["startY"] = 
			circle["size"] = Math.floor(Math.random() * 15 + 8);
			circle["speed"] = Math.floor(Math.random() * 25 + 20);
			circle["direction"] = Math.floor(Math.random() * 2);
			circleInfos.push(circle);
		}
	}

	onMount(() => {
		createCircles();
	});
	
</script>

<main>
	<div class="main-circle"></div>
	
	<h1 class="title">ft_transcendence</h1>
</main>

