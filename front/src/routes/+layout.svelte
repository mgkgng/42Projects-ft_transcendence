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
	import '$lib/scss/app.scss';
	import { darkMode, loginState } from "$lib/stores/var";
	import { client } from '$lib/stores/client';
    import { onMount } from 'svelte';
	import jwt_decode from "jwt-decode";
    import { browser } from '$app/environment';
	import io from "socket.io-client";
    import { goto } from "$app/navigation";

	let login: boolean;
	let dark : boolean;

	loginState.subscribe(value => { login = value; });
	darkMode.subscribe(value => { dark = value; });

	onMount(async () => {

		if (localStorage.getItem('transcendence-jwt') != null
		&& localStorage.getItem('transcendence-jwt') != undefined)
		{
			const tok = localStorage.getItem('transcendence-jwt');
			{
				$client.socket = io("http://localhost:3000",{
					extraHeaders: {
						Authorization: "Bearer " + tok,
					}
				});
				$client.connect();
				loginState.set(true);
			}
		}

		let url = new URLSearchParams(window.location.search);

		if (!login && url.has('code'))
		{
			console.log("ORHERE");
			const res : any = await fetch("http://localhost:3000/auth42",{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body:JSON.stringify({username: "oui", password: url.get('code')}),
			});
			const tok = await res.json();
			console.log("TOK:", tok);
			$client.socket = io("http://localhost:3000",{
				extraHeaders: {
					Authorization: "Bearer " + tok.access_token,
				}
			});
			localStorage.setItem('transcendence-jwt', tok.access_token);
			$client.connect();
			const val : any = await jwt_decode(localStorage.getItem("transcendence-jwt"));
			console.log("Hello: ", val);
			loginState.set(true);
		}

		if (!browser || !$client.socket)
			return;
		$client.socket.on("MatchFound", (data: any) => {
			console.log("MatchFound", data);
			goto(`/play/${data.room}`);
		});
		// let res = await $client.send42Tok(new URLSearchParams(window.location.search));
		// if (res) {
		// 	const val : any = await jwt_decode(localStorage.getItem("transcendence-jwt"));
		// 	console.log("Hello: ", val);
		// 	loginState.set(true);
		// }
	})
</script>

<main style="{(dark) ? "background-color: #000" : "background-color: #fff"}">
	<slot />
</main>
