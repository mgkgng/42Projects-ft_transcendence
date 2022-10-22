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

	import { client } from "$lib/stores/client";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
	import { page } from '$app/stores';

    import RoomList from "$lib/modals/RoomList.svelte";
    import Room from "$lib/modals/Room.svelte";
    import { user, getCookie } from "$lib/stores/user";

	import Profile from "$lib/Profile.svelte"

	let createGameModal: any;
	let roomListModal: any;
	let roomModal: any;

	let roomId: string = "";

	let menuExpanded: boolean;
	let loginState: boolean = false;

	onMount(() => {
		/** Listeners for authentification*
		*/
		$client.addListener('ResLoginToken', (data: any) => {
			console.log('ResLoginToken', data.user);

			console.log("before...:", user);
			user.set(data.user);
			document.cookie = `transcendence-jwt=${data.jwt}`;
			
			console.log("What??", user);
			loginState = true;
			goto('/');
		});

		$client.addListener('ResVerifyJWT', (data: any) => {
			console.log(data);
			if (!data.success) {
				user.set(undefined);
				return ;
			}
			user.set(data.user);
			loginState = true;
		});

		/** Verify authentification */
		const code = String($page.url).split('code=')[1];
		console.log("code: ", code);
		if (code) {
			console.log("allo");
			$client.sock.send(JSON.stringify({
				event: "AskVerifyToken",
				data: {
					client: $client.id,
					code: code
				}
			}));
		}

		const jwt = getCookie("transcendence-jwt");
		console.log("jwt:", jwt);
		if (jwt) {
			$client.sock.send(JSON.stringify({
				type: "AskVerifyJWT",
				data: {
					client: $client.id,
					jwt: jwt
				}
			}));
		}

		/** The Rest */

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

		$client.addListener('LoginTokenError', (data: any) => {
			console.log('tokenError', data);
			// LoginErrorMsgModal.open();
		});

		return (() => {
			$client.removeListeners(["ResLoginToken", "ResVerifyJWT", 
				"MatchFound", "RoomCreated"]);
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

<Title bind:loginState={loginState} title={"transcendence"} mainPage={true} />

<DarkMode/>

<!-- <Profile /> -->

<MenuCircle createGameModal={createGameModal} roomListModal={roomListModal} bind:expanded={menuExpanded}/>
