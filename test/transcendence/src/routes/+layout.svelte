<style lang="scss">
	body {
		font-family: 'alpha-prota';
		height: 100%;
		color: $text;
		padding: 0;
		margin: 0;
	}

	main {
		padding: 0;
		height: 100vh;
	}

</style>

<script lang="ts">
	import '$lib/stores/client';
	import { darkMode } from "$lib/stores/var";
    import DarkMode from '$lib/DarkMode.svelte';
    import MenuCircle from '$lib/MenuCircle.svelte';

	let dark : boolean;

	darkMode.subscribe(value => {
		dark = value;
	});
</script>

<main style="{(dark) ? "background-color: #000" : "background-color: #fff"}">
	<slot />
	<DarkMode/>
	<MenuCircle />
</main>

