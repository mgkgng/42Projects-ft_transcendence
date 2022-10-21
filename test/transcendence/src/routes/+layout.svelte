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
		width: 100vw;
		height: 100vh;
		overflow: hidden;
	}


</style>

<script lang="ts">
	import '$lib/stores/client';
	import { darkMode } from "$lib/stores/var";
	import '$lib/scss/app.scss'
   
	let dark : boolean;

	darkMode.subscribe(value => {
		dark = value;
	});
</script>

<main style="{(dark) ? "background-color: #000" : "background-color: #fff"}">
	<slot />
</main>

