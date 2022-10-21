<style lang="scss">
	.container {
		max-height: 100%;
		background-color: rgba(0, 0, 0, 0);
		display: grid;
		grid-template-rows: 90vh 10vh;
		gap: 0;
		padding: 0;
	}

</style>

<script lang="ts">
	import Title from "$lib/Title.svelte";
	import DarkMode from '$lib/DarkMode.svelte';
    import MenuCircle from '$lib/MenuCircle.svelte';
	import CreateGame from "$lib/modals/CreateGame.svelte";
	import Modal from "$lib/tools/Modal.svelte";
	import Login from "$lib/modals/Login.svelte";

	import { client } from "$lib/stores/client";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import RoomList from "$lib/modals/RoomList.svelte";
    import Room from "$lib/modals/Room.svelte";
    import { user, getCookie } from "$lib/stores/user";

	let createGameModal: any;
	let roomListModal: any;
	let roomModal: any;
	let loginModal: any;

	let roomId: string = "";

	let menuExpanded: boolean;
	let loginState: boolean;

	onMount(() => {
		$client.addListener('ResVerifyJWT', (data: any) => {
			console.log(data);
			if (!data.success) {
				user.set(undefined);
				return ;
			}

			user.set(data.user);
			loginState = true;
			loginModal.close();
		});

		$client.addListener("MatchFound", (data: any) => {
			console.log("MatchFound", data);
			roomId = data;
			$client.room = data;
			roomModal.open();
		});

		$client.addListener("RoomCreated", (data: any) => {
			console.log("RoomCreated", data);
			roomId = data;
			$client.room = data;
			createGameModal.close();
			menuExpanded = false;
			roomModal.open();
		});

		const jwt = getCookie("transcendence-jwt");

		if (jwt === undefined)
			return ; //a verifier

		function verifyJWT() {
			if (!jwt)
				return ;
			$client.sock.send({
				type: "AskVerifyJWT",
				data: {
					client: $client.id,
					jwt: jwt
				}
			});
		}

		$client.OnConnection(verifyJWT);

		$client.addListener('ResLoginToken', (data: any) => {
			console.log('ResLoginToken', data);
			user.set(data.user);
			document.cookie = `transcendence-jwt=${data.jwt}`;
			loginState = true;
			loginModal.close();
		});

		$client.addListener('LoginTokenError', (data: any) => {
			console.log('tokenError', data);
			// LoginErrorMsgModal.open();
		});

		return (() => {
			$client.removeListeners(["MatchFound", "RoomCreated"]);
			$client.removeOnConnection(verifyJWT);
		});
	});
</script>

<Modal bind:this={createGameModal} closeOnBgClick={true}>
	<CreateGame />
</Modal>

<Modal bind:this={roomListModal} closeOnBgClick={true}>
	<RoomList />
</Modal>

<Modal bind:this={roomModal} closeOnBgClick={false}>
	<Room roomId={roomId}/>
</Modal>

<Modal bind:this={loginModal} closeOnBgClick={false}>
	<Login bind:loginState={loginState}/>
</Modal>

<Title title={"transcendence"} mainPage={true} />

<DarkMode/>
<MenuCircle createGameModal={createGameModal} roomListModal={roomListModal} bind:expanded={menuExpanded}/>
