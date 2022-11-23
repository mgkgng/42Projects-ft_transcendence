<style lang="scss">
	.settings {
		width: 25em;
		height: 36em;
		align-items: center;

		.image {
			position: relative;
			width: 12em;
			height: 12em;
			padding: .5em;
			border: $border-thin;
			border-radius: .3em;
			overflow: hidden;

			img {
				flex-shrink: 0;
				max-width: 11em;
				height: 11em;
				object-fit: cover;
				border-radius: .3em;
			}

			button {
				position: absolute;
				bottom: 0;
				right: 0;
				padding: .2em .4em;
				border-left: $border-thin;
				border-top: $border-thin;
				border-radius: .2em;
				transition: .2s;

				&:hover {
					background-color: #313131;
				}
			}
		}

		.grid {
			width: 100%;
			display: grid;
			grid-template-columns: 30% 70%;

			&:nth-child(2) {
				p { font-size: 12px; }
			}
		}

		.username {
			button {
				padding: .1em .5em;
				border: $border-thin;
				border-radius: .2em;
				transition: .2s;

				&:hover {
					background-color: #313131;
				}

			}
		}

		.auth {
			p { font-size: 13px; }

			gap: .2em;
			
			input { display: none; }
			input[id="on"]:checked+label { background-color: $green; }
			input[id="off"]:checked+label { background-color: $red; }

			label {
				display: inline-block;
				border: $border-thin;
				border-radius: .2em;
				width: 5em;
				height: 1.8em;
				text-align: center;
				padding: .2em;
				font-size: 17px;
				cursor: pointer;
			}

		}
	}
</style>

<script lang="ts">
    import { user } from "$lib/stores/user";
    import { onMount } from "svelte";
    import { client } from "$lib/stores/client";
    import Modal from "$lib/tools/Modal.svelte";
    import ChangeUsername from "$lib/settings/ChangeUsername.svelte";
	
	export let itself: any;

	let changeUsernameModal: any;
	
	let double_auth: boolean = $user.is_2fa;
	let newUsername: string = "";

	console.log(double_auth);

	onMount(() => {

		// 	$client.socket.on("active_double_auth", (data) => {
		// 		user_info.is_2fa = true; 
		// 	});
		// 	$client.socket.on("disable_double_auth", (data) => {
		// 		user_info.is_2fa = false; 
		// 	});
		// console.log("username ", $chatRoom.username_search, $client.user_info.username);
		// if ($chatRoom.username_search == $client.user_info.username)
		// {
		// 	user_info = $client.user_info;
		// 	client.subscribe(value => {	user_info = value.user_info;	});
		// }
		// else
		// 	$client.socket.emit("get_other_user_info", { username_search: $chatRoom.username_search } );

		return (() => {
			$client.removeListeners("get_user_info");
		})
	});
</script>

<Modal bind:this={changeUsernameModal} closeOnBgClick={false}>
	<ChangeUsername itself={changeUsernameModal} bind:newUsername={newUsername}/>
</Modal>

<div class="vflex window settings">
	<h2>Settings</h2>
	<div class="image">
		<img src="{((!$user.img) ? $user.img_url : $user.img)}" alt="profile">
		<button>modify</button>
	</div>
	<div class="grid">
		<p>Username:</p>
		<div class="flex username">
			<p>{$user.username}</p>
			<button on:click={() => { changeUsernameModal.open(); }}>modify</button>
		</div>
	</div>
	<div class="grid">
		<p>Double Authentification (QR Code):</p>
		<div class="flex auth">
			<input type="radio" id="on" bind:group={double_auth} name="double_auth" value={true}>
			<label for="on">ON</label>
			<input type="radio" id="off" bind:group={double_auth} name="double_auth" value={false}>
			<label for="off">OFF</label>
		</div>
	</div>
	<div class="flex buttons">
		<button>Go Back</button>
		<button on:click={() => { $client.socket.emit("get_user_info"); }}>Save Changes</button>
	</div>
</div>