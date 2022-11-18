<style lang="scss">

</style>

<script lang="ts">
	import '$lib/stores/client';
	import '$lib/scss/app.scss';
	import Title from "$lib/Title.svelte";
	import { client } from "$lib/stores/client";
    import { onMount } from "svelte";
    import { loginState } from "$lib/stores/var";
    import { browser } from "$app/environment";
    import Header from "$lib/header/Header.svelte";
	import Modal from '$lib/tools/Modal.svelte';
	import Room from "$lib/game/Room.svelte";
	import Message from '$lib/modals/Message.svelte';
	import PlayOrChat from "$lib/modals/PlayOrChat.svelte";
    import CreateGame from "$lib/modals/CreateGame.svelte";
    import EnterGame from "$lib/modals/EnterGame.svelte";
    import RoomList from "$lib/modals/RoomList.svelte";
	// import { chatRoom } from '$lib/stores/chatRoom';
	import io, { Socket } from "socket.io-client";
    import { user } from '$lib/stores/user';
    import { goto } from '$app/navigation';
	import jwt_decode from "jwt-decode";


	let roomModal: any;
	let roomId: string = "";

	let messageModal: any;
	let modalMessage: string = "";

	let roomListModal: any;
	let enterModal: any;
	let enterGameModal: any;
	let createGameModal: any;

	let login: boolean;

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
			const val : any = await jwt_decode(tok.access_token);
			loginState.set(true);
			goto('/');
		}catch(e){
			loginState.set(false);
			localStorage.removeItem('transcendence-jwt');
		}
	}

	onMount(async () => {
		

		if (!browser)
			return ;

		console.log("yo?");

		

		if (!$client.socket) {
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
				});	

				$client.socket.on("connection", (data: any) => {
					console.log("connection", data);
					$client.connect();
					loginState.set(true);
					// $chatRoom.LoadMessages($client);
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

			console.log("here", $client);
			if ($client.socket)
				goto('/');
			else
				return ;
		}

		$client.socket.on("RoomCreated", (data: any) => {
			console.log("RoomCreated", data);
			roomId = data;
			roomModal.open();
		});

		$client.socket.on("JoinRoomRes", (data: any) => {
			console.log("WTF?", data);
			if (data.allowed) {
				roomId = data.roomId;
				roomListModal.close();
				roomModal.open();
				return ;
			} else {
				modalMessage = "You cannot enter this room";
				messageModal.open();
			}	
		});
	});
</script>

<Modal bind:this={enterModal}>
	<PlayOrChat itself={enterModal} enterGameModal={enterGameModal}/>
</Modal>

<Modal bind:this={createGameModal}>
	<CreateGame itself={createGameModal} enterGameModal={enterGameModal}/>
</Modal>

<Modal bind:this={enterGameModal}>
	<EnterGame itself={enterGameModal} createGameModal={createGameModal} roomListModal={roomListModal}/>
</Modal>

<Modal bind:this={roomListModal}>
	<RoomList itself={roomListModal} enterGameModal={enterGameModal}/>
</Modal>

<Modal bind:this={messageModal}>
	<Message itself={messageModal} msg={modalMessage}/>
</Modal>

<Modal bind:this={roomModal} closeOnBgClick={false}>
	<Room itself={roomModal} roomId={roomId}/>
</Modal>

<Header />
<Title title={"TRANSCENDENCE"} roomListModal={roomListModal} enterModal={enterModal}
	enterGameModal={enterGameModal} createGameModal={createGameModal}/>