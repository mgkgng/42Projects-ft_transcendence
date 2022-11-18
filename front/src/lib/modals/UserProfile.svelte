<style lang="scss">
	.profile {
		width: 550px;
		padding: 1.8em 1.5em;
		gap: .5em;

		.info {
			position: relative;

			width: 100%;
			max-height: 400px;
			border-radius: .4em;
			border: $border-thin;
	
			text-align: center;
	
			padding: 1em;
	
			color: #e6e6e6;
	
			.photo {
				img {
					width: 120px;
					height: 150px;
					object-fit: cover;
					border-radius: .4em;
				}
			}

			.data {
				gap: .5em;
				
				p {
					width: 100%;
				}
	
				.username {
					font-size: 20px;
					border-radius: .2em;
					cursor: pointer;
					transition: .2s;

					&:hover { background-color: transparentize(#fff, .6); }
				}

			}
			.tools {
				position: absolute;

				right: 0;
				bottom: .6em;
				padding: .3em;

				
				gap: .5em;

				border: $border-thin;
				border-right: none;
				border-radius: .2em 0 0 .2em;

				transition: .2s;
		
				button {
					width: 1.5em;
					aspect-ratio: 1 / 1;
					border-radius: 1em;
					border: 2px solid transparentize(#fff, .5);
					cursor: pointer;
					transition: .2s;
		
					&:hover {
						transform: scale(1.05);

					}

					&:nth-child(1):hover { background-color: $main-bright;}
					&:nth-child(2):hover { background-color: $submain-blue;}
					&:nth-child(3):hover { background-color: $green;}
				}

				&:hover {
					background-color: transparentize(#fff, 0.9);
				}
			}
		}

		.history {
			width: 100%;
			min-height: 200px;
			border-radius: .3em;
	
			text-align: center;
	
			border: $border-thin;
			padding: 1.2em;
	
			color: #e6e6e6;
			font-size: 36px;
	
			overflow-y: scroll;
		}
	}
	


</style>

<script lang="ts">
    import { user } from "$lib/stores/user";
    import { onMount } from "svelte";
    import { client } from "../stores/client";

	import { chatRoom } from "$lib/stores/chatRoom.ts";
    import { browser } from '$app/environment';
	import QrcodeModal from "$lib/modals/qrcodeModal.svelte"
    import Modal from "$lib/tools/Modal.svelte";

	export let profileUser: any;
	$: console.log(profileUser);

	let gameHistory: Array<any> = [];

	let username : string = "";
	let local_username : string;
	let new_username : any = "";
	let user_info = null;
	let qrcode_modal : any;

	chatRoom.subscribe(value => {	username = value.username_search;	});
	client.subscribe(value => {	local_username = value.username; });
	onMount(() => {
		if ($client.socket._callbacks.$get_other_user_info == null) {
			$client.socket.on("get_other_user_info", (data) => {
				console.log(data);
			});

			$client.socket.on("error_get_other_user_info", (data) => {
				alert("Error: " + data);	
			});
			$client.socket.on("error_change_username", (data) => {
				alert("Error: " + data);	
			});
			$client.socket.on("change_username", (data) => {
				$client.socket.emit("get_user_info",{});
				chatRoom.update((value) => {
					value.username_search = data.new_username;
					return value;
				});
				$client.socket.emit("get_user_info", { } );
			});
			$client.socket.on("active_double_auth", (data) => {
				user_info.is_2fa = true; 
			});
			$client.socket.on("disable_double_auth", (data) => {
				user_info.is_2fa = false; 
			});
			// $client.socket.emit("getHistory", { username: profileUser.username });
			// $client.socket.emit("resHistory", (data: any) => {
			// 	gameHistory = data.history
			// });
		}
		console.log("username ", $chatRoom.username_search, $client.user_info.username);
		if ($chatRoom.username_search == $client.user_info.username)
		{
			user_info = $client.user_info;
			client.subscribe(value => {	user_info = value.user_info;	});
		}
		else
			$client.socket.emit("get_other_user_info", { username_search: $chatRoom.username_search } );
	});
	function changeUsername()
	{
		new_username = prompt("Enter new username");
		$client.socket.emit("change_username", { new_username: new_username });
	}
	function seeQrcode()
	{
		qrcode_modal.open();
	}
	function active2FA()
	{
		$client.socket.emit("active_double_auth");
	}
	function disable2FA()
	{
		$client.socket.emit("disable_double_auth");
	}
</script>

<div class="vflex window profile">
	<div class="flex info">
		{#if user_info}
			<div class="photo">
				<img src={user_info.img_url} alt="grosse-tete">
			</div>
			<div class="vflex data">
				<p class="username">{user_info.display_name} a.k.a. {user_info.username}</p>
				<p class="campus">Campus: {user_info.campus_name}, {user_info.campus_country}</p>
			</div>
			{#if user_info.username == $client.username}
			<div class="flex tools">
				<button>A</button>
				<button>B</button>
				<button>M</button>
			</div>
			{/if}
		{/if}
	</div>
	<div class="info-zone history">
		{#if user_info}
			<p>Username: {user_info.username}</p>
			{#if user_info.username == $client.username}
				<input class="btn-room" type="button" value="Change" on:click={changeUsername} />
			{/if}
			<p>Campus : {user_info.campus_name}, {user_info.campus_country}</p>
			{#if user_info.is_2fa == false}
				<p>Double authentification:</p>
				<input type="button" class="btn-room" name="scales" value="active" on:click={active2FA}>
			{:else}
				<p>Double authentification:</p>
				<input on:click={seeQrcode} class="btn-room" type="button" value="qrcode">
				<input type="button" name="scales" class="btn-room" value="disable" on:click={disable2FA}>
			{/if}
		{/if}
	</div>
	<div class="history">
		{#if gameHistory.length}
		<div class="line">

		</div>
		{:else}
		<p>No Game History Yet</p>
		{/if}
	</div>
</div>