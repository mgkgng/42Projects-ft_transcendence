<style lang="scss">
	main {
		padding: 0;
		width: 100vw;
		min-width: 800px;
		height: 100vh;
		overflow: hidden;
		display: flex;
		justify-content: center;

		background-color: #000;

		.load {
			position: absolute;
			color: #fff;
			top: 50%;
			left: 50%;

			width: 5em;
			height: 5em;

			p {
				position: absolute;
				top: 18%;
				left: 8%;
			}
		}
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
    import { loaded, login } from "$lib/stores/var";
	import Modal from '$lib/tools/Modal.svelte';
    import VerifyCode from '$lib/home/VerifyCode.svelte';

	let verifCodeModal : any;
	let tok : any;

	async function connectWithUrlCode(url : any)
	{
		try{
			const res : any = await fetch(`http://${location.hostname}:3000/auth42`,{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({username: "oui", password: url.get('code')}),
			});
			tok = await res.json();
			if (tok.get_code != null)
			{//lunch the modal qrcode
				verifCodeModal.open();
			}
			else {
				console.log("Oupsi");
				// while (tok.get_code != null)
				// {
				//  	let ufa_code : any = prompt("Your code is : ");
				//  	const res_ufa : any = await fetch("http://cb8e2569788b:3000/",{
				//  		method: 'POST',
				//  		headers: {
				//  			'Content-Type': 'application/json'
				//  		},
				//  		body:JSON.stringify({username: ufa_code, password: tok.tmp_jwt}),
				//  	});
				//  	tok = await res_ufa.json();
				// }
				$client.socket = io(`http://${location.hostname}:3001`,{
					extraHeaders: {
						Authorization: "Bearer " + tok.access_token,
					}
				});
				if (tok.access_token) {
					localStorage.setItem('transcendence-jwt', tok.access_token);
					login.set(true);
				}
				goto('/');
			}
		} catch(e){
			console.log("NOT CONNECTED");
			localStorage.removeItem('transcendence-jwt');
		}
	}

	onMount(async () => {
		if (!browser || $client.socket)
			return ;
		if (!$client.socket) {
			if (localStorage.getItem('transcendence-jwt') != null
				&& localStorage.getItem('transcendence-jwt') != undefined)
			{
				const tok = localStorage.getItem('transcendence-jwt');
				{
					$client.socket = await io(`http://${location.hostname}:3001`,{
						extraHeaders: {
							Authorization: "Bearer " + tok,
						},
						autoConnect: false,
					},);
					await $client.socket.connect();
				}
			}

			let url = new URLSearchParams(window.location.search);
			if ((!$client.socket || !$client.socket.connected) && url.has('code'))
				await connectWithUrlCode(url);

			if ($client.socket) {
				$client.socket.on("get_user_info_res", (data: any) => {
					client.username = data.username;
					user.set(data);
					login.set(true);
				});
				$client.socket.emit("get_user_info", {});
			}

			setTimeout(() => {
				loaded.set(true);
			}, 1000);
			
			return (() => { 
				$client.socket.off("get_user_info_res"); 
			});
		}
	});
</script>

<Modal bind:this={verifCodeModal}>
	<VerifyCode  tok={tok} itself={verifCodeModal} />
</Modal>

<main>
	{#if $loaded}
	<slot />
	{:else}
	<div class="load">
		<div class="loading"></div>
		<p>Loading...</p>
	</div>
	{/if}
</main>