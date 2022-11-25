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
				border-radius: .2em 0 0 0;
				transition: .2s;

				&:hover { background-color: transparentize(#fff, .4); }
			}
		}

		.options {
			width: 100%;
			justify-content: center;
			align-items: center;
			gap: .3em;
			
			h4 {
				padding-bottom: .2em;
				border-bottom: $border-thin;
			}

			.username {
				margin-bottom: 1em;
				gap: .3em;
				align-items: center;

				button {
					padding: .2em .5em;
					border: $border-thin;
					border-radius: .2em;
					transition: .2s;

					&:hover { background-color: transparentize(#fff, .4); }
				}
			}
			.auth {
				margin-bottom: 1em;
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
		.buttons {
			gap: .2em;
			button {
				width: 6em;
				height: 4em;
				border: $border;
				border-radius: .3em;
				background-color: $main-bright;

				&:first-child { background-color: $submain-blue; }
				&:not(.no-active):hover { filter: brightness(80%); }
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
    import ConfirmLeave from "$lib/settings/ConfirmLeave.svelte";
	
	export let itself: any;

	let img: any = ($user.img) ? $user.img : $user.img_url;
	let username = $user.username
	let doubleAuth: boolean = $user.is_2fa;

	let original = [img, username, doubleAuth]
	let modified: boolean = false;
	$: modified = !original.every((v, i) => { return v === Array(img, username, doubleAuth)[i]})
	$: console.log("modify check", modified);

	let changeUsernameModal: any;
	let confirmLeaveModal: any;

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
	<ChangeUsername itself={changeUsernameModal} bind:username={username}/>
</Modal>

<Modal bind:this={confirmLeaveModal} closeOnBgClick={false}>
	<ConfirmLeave itself={confirmLeaveModal} settingModal={itself} />
</Modal>


<div class="vflex window settings">
	<h2>Settings</h2>
	<div class="image">
		<img src="{((!$user.img) ? $user.img_url : $user.img)}" alt="profile">
		<button>modify</button>
	</div>
	<div class="vflex options">
		<h4>Username:</h4>
		<div class="flex username">
			<p>{$user.username}</p>
			<button on:click={() => { changeUsernameModal.open(); }}>modify</button>
		</div>
		<h4>Double Authentification (QR Code):</h4>
		<div class="flex auth">
			<input type="radio" id="on" bind:group={doubleAuth} name="double_auth" value={true}>
			<label for="on">ON</label>
			<input type="radio" id="off" bind:group={doubleAuth	} name="double_auth" value={false}>
			<label for="off">OFF</label>
		</div>
	</div>
	<div class="flex buttons">
		<button on:click={() => {
			if (!modified)
				itself.close();
			confirmLeaveModal.open();
		}}>Close</button>
		<button class="{(modified) ? "" : "no-active"}" on:click={() => {
			if (modified)
				$client.socket.emit("get_user_info");
		}}>Save Changes</button>
	</div>
</div>