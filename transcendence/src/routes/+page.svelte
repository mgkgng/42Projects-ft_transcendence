<style lang="scss">
	.container {
		max-height: 100%;
		background-color: rgba(0, 0, 0, 0);
		display: grid;
		grid-template-rows: 90vh 10vh;
		gap: 0;
		padding: 0;
	}

	@keyframes size-change {
		0% { transform: scale(1) }
		50% { transform: scale(1.3) }
		100% { transform: scale(1) }
	}
</style>

<script lang="ts">
	import Title from "$lib/Title.svelte";
	import Navbar from "$lib/Navbar.svelte";
	import DarkMode from "$lib/DarkMode.svelte";

	import { client } from "$lib/stores/client";
    import { onMount } from "svelte";

	onMount(() => {
		$client.addListener("resTest", () => {
			console.log("res arrived!");
		})
	});
</script>

<div class="container">
	<DarkMode/>
	<Title />
	<Navbar />
</div>

