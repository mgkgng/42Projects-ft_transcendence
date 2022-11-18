<style lang="scss">
	main {
		padding: 0;
		width: 100vw;
		height: 100vh;
		overflow: hidden;

		background-color: #000;
	}
</style>

<script lang="ts">
	import '$lib/scss/app.scss';
	import io, { Socket } from "socket.io-client";
    import { user } from '$lib/stores/user';
    import { goto } from '$app/navigation';
	import jwt_decode from "jwt-decode";
	import { client } from "$lib/stores/client";
    import { onMount } from "svelte";
	import { browser } from "$app/environment";
    import { loginState } from "$lib/stores/var";

	let login: boolean;
	let tryConnect: boolean = false;

	loginState.subscribe(value => { login = value; });

	async function connectWithUrlCode(url : any)
	{
		try{ 
			const res : any = await fetch("http://localhost:3000/auth42",{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body:JSON.stringify({username: "oui", password: url.get('code')}),
			});
			let tok = await res.json();
			console.log("tok1", tok);
			while (tok.get_code != null)
			{
				let ufa_code : any = prompt("Your code is : ");
				console.log(ufa_code);
				const res_ufa : any = await fetch("http://localhost:3000/auth42",{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body:JSON.stringify({username: ufa_code, password: tok.tmp_jwt}),
				});
				tok = await res_ufa.json();
				console.log("tok2", tok);
			}
			console.log("res", tok);
			$client.socket = io("http://localhost:3001",{
				extraHeaders: {
					Authorization: "Bearer " + tok.access_token,
				}
			});
			console.log(tok.access_token)
			localStorage.setItem('transcendence-jwt', tok.access_token);
			$client.connect();
			loginState.set(true);
			goto('/');
		}catch(e){
			console.log("NOT CONNECTED");
			loginState.set(false);
			localStorage.removeItem('transcendence-jwt');
		}
	}

	onMount(async () => {
		if (!browser || $client.socket)
			return ;

		if (!$client.socket) {
			console.log("Again?", $client.socket);
			if (localStorage.getItem('transcendence-jwt') != null
				&& localStorage.getItem('transcendence-jwt') != undefined)
			{
				console.log("came here");
				const tok = localStorage.getItem('transcendence-jwt');
				{
					$client.socket = await io("http://localhost:3001",{
						extraHeaders: {
							Authorization: "Bearer " + tok,
						},
						autoConnect: false,
					},);
					await $client.socket.connect();
					console.log($client.socket);
				}
			}

			let url = new URLSearchParams(window.location.search);
			if ((!$client.socket || !$client.socket.connected) && url.has('code'))
				await connectWithUrlCode(url);

			if ($client.socket) {
				$client.socket.on("GetConnectionInfo", (data: any) => {
					console.log("GetConnectionInfo", data);
					$client.id = data.id;
					user.set(data.user);
					// $client.socket.off("GetConnectionInfo");
				});	

				$client.socket.on("connection", (data: any) => {
					console.log("connection", data);
					$client.connect();
					loginState.set(true);
					// $chatRoom.LoadMessages($client);
					// $client.socket.off("connection");
				});
				$client.socket.on("get_user_info", (data: any) => {
					client.update((value) => {
						value.username = data.username;
						value.user_info = data;
						return value;
					});
					console.log("DATA: ", data);
					// $client.socket.off("get_user_info");
				});
				$client.socket.emit("get_user_info", {});
			}
			tryConnect = true;
			// if ($client.socket) {
			// 	goto('/');
			// }
			// else
			// 	return ;
		}
	});
</script>

<main>
	{#if tryConnect}
	<slot />
	{:else}
	<div>Loading...</div>
	{/if}
</main>