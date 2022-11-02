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
	import { chatRoom } from '$lib/stores/chatRoom';
    import { onMount } from 'svelte';
	import jwt_decode from "jwt-decode";
    import { browser } from '$app/environment';
	import io from "socket.io-client";
    import { goto } from "$app/navigation";
    import { user } from '$lib/stores/user';
    import Modal from '$lib/tools/Modal.svelte';
	import Room from "$lib/game/Room.svelte";


	let login: boolean;
	let dark : boolean;

	let roomModal: any;

	let roomId: string = "";


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
			const res : any = await fetch("http://localhost:3000/auth42",{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body:JSON.stringify({username: "oui", password: url.get('code')}),
			});
			const tok = await res.json();
			$client.socket = io("http://localhost:3000",{
				extraHeaders: {
					Authorization: "Bearer " + tok.access_token,
				}
			});
			localStorage.setItem('transcendence-jwt', tok.access_token);
			$client.connect();
			const val : any = await jwt_decode(localStorage.getItem("transcendence-jwt"));
			loginState.set(true);
			goto('/');
		}

		$client.socket.on("GetConnectionInfo", (data: any) => {
			console.log("GetConnectionInfo", data);
			$client.id = data.id;
			user.set(data.user);
			console.log("lol", $user);
			
		});

		if (!browser || !$client.socket)
			return;
		
		$client.socket.on("RoomCreated", (data: any) => {
			console.log("RoomCreated", data);
			roomId = data;
			roomModal.open();
		});

		$chatRoom.LoadMessages($client);
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

<Modal bind:this={roomModal} closeOnBgClick={false}>
	<Room itself={roomModal} roomId={roomId}/>
</Modal>
