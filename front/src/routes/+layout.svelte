<style lang="scss">
	// body {
	// 	font-family: 'alpha-prota';
	// 	height: 100%;
	// 	color: $text;
	// 	padding: 0;
	// 	margin: 0;
	// }

	main {
		padding: 0;
		width: 100vw;
		height: 100vh;
		overflow: hidden;

		background-color: #000;
	}
</style>

<script lang="ts">
	import '$lib/stores/client';
	import '$lib/scss/app.scss';
	import { loginState } from "$lib/stores/var";
	import { client } from '$lib/stores/client';
	import { chatRoom } from '$lib/stores/chatRoom';
    import { onMount } from 'svelte';
	import jwt_decode from "jwt-decode";
    import { browser } from '$app/environment';
	import io, { Socket } from "socket.io-client";
    import { goto } from "$app/navigation";
    import { user } from '$lib/stores/user';
    import Modal from '$lib/tools/Modal.svelte';
	import Room from "$lib/game/Room.svelte";


	let login: boolean;

	let roomModal: any;

	let roomId: string = "";


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
				console.log("waiting for code");
				let ufa_code : any = prompt("Your code is : ");
				console.log(ufa_code);
				const res_ufa : any = await fetch("http://localhost:3000/auth42",{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					//body:JSON.stringify({username: "oui", password: url.get('code')}),
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
			localStorage.setItem('transcendence-jwt', tok.access_token);
			$client.connect();
			const val : any = await jwt_decode(localStorage.getItem("transcendence-jwt"));
			loginState.set(true);
			goto('/');
		}catch(e){
			loginState.set(false);
			localStorage.removeItem('transcendence-jwt');
		}
	}

	onMount(async () => {
		if ($client.socket || !browser)
			return;
		if (localStorage.getItem('transcendence-jwt') != null
		&& localStorage.getItem('transcendence-jwt') != undefined)
		{
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
			$client.socket.off("GetConnectionInfo", (data: any) => {
			});
			$client.socket.on("GetConnectionInfo", (data: any) => {
				console.log("GetConnectionInfo", data);
				$client.id = data.id;
				user.set(data.user);
				console.log("lol", $user);
				
			});	

			$client.socket.off("RoomCreated", (data: any) => {
			});
			$client.socket.on("RoomCreated", (data: any) => {
				console.log("RoomCreated", data);
				roomId = data;
				roomModal.open();
			});

			$client.socket.on("JoinRoomRes", (data: any) => {
				console.log("coucou?", data);
				if (data.allowed) {
					roomId = data.roomId;
					roomModal.open();
					return ;
				}
				// If couldn't join the game, there should be an error message
				// and also ask for roomsDataUpdate
			});

			$client.socket.off("connection", (data: any) => {
			});
			$client.socket.on("connection", (data: any) => {
				console.log("connection", data);
				$client.connect();
				loginState.set(true);
				$chatRoom.LoadMessages($client);
			});
			$client.socket.off("get_user_info", (data: any) => {
			});
			$client.socket.on("get_user_info", (data: any) => {
				client.update((value) => {
					value.username = data.username;
					value.user_info = data;
					return value;
				});
				console.log("DATA: ", data);
			});
			$client.socket.emit("get_user_info", {});
		}
		// let res = await $client.send42Tok(new URLSearchParams(window.location.search));
		// if (res) {
		// 	const val : any = await jwt_decode(localStorage.getItem("transcendence-jwt"));
		// 	console.log("Hello: ", val);
		// 	loginState.set(true);
		// }
	})
</script>

<main>
	<slot />
</main>

<Modal bind:this={roomModal} closeOnBgClick={false}>
	<Room itself={roomModal} roomId={roomId}/>
</Modal>
