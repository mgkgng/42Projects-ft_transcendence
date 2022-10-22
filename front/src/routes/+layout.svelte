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
	import { darkMode, loginState } from "$lib/stores/var";
	import { client } from '$lib/stores/client';
	import '$lib/scss/app.scss';
    import { onMount } from 'svelte';
	import jwt_decode from "jwt-decode";
    import { browser } from '$app/environment';

	let dark : boolean;

	darkMode.subscribe(value => {
		dark = value;
	});

	onMount(async () => {
		let res = await $client.send42Tok(new URLSearchParams(window.location.search));
		if (res) {
			const val : any = await jwt_decode(localStorage.getItem("transcendence-jwt"));
			console.log("Hello: ", val);
			loginState.set(true);
		}
	})
</script>

<main style="{(dark) ? "background-color: #000" : "background-color: #fff"}">
	<slot />
</main>
