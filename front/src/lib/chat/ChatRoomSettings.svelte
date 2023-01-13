<style lang="scss">
	.settings {
		width: 450px;
		height: 320px;
		justify-content: space-around;
		align-items: center;
		gap: .3em;

		.private {
			margin-bottom: 1em;
			gap: .2em;
			
			input { display: none; }
			input[type="radio"]:checked+label { background-color: $main-bright; }

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
		.password {
			gap: .2em;
			input { display: none; }
			input[id="with"]:checked+label { background-color: $yellow; }
			input[id="without"]:checked+label { background-color: $red; }

			label {
				display: inline-block;
				border: $border-thin;
				border-radius: .2em;
				width: 7em;
				height: 3em;
				text-align: center;
				padding: .3em;
				font-size: 17px;
				cursor: pointer;
			}
		}

		.input {
			width: 80%;

			input {
					border-radius: .2em;
					padding-left: .5em;
		
					width: 100%;
					height: 1.8em;
		
					background-color: #fff;
					color: #000;
				}
		
				.empty {
					border-radius: .2em;
					width: 100%;
					height: 1.8em;
					background-color: #000;
				}
		}

		.buttons {
			gap: .3em;
			button {
				border: $border-thin;
				border-radius: .3em;
				width: 4em;
				height: 2.5em;
				background-color: $main-bright;
				
				&:first-child { background-color: $submain-blue}
			}
		}
	}
</style>

<script lang="ts">
    import { ChattRoom } from "$lib/chatt/ChattRoom";
	import Modal from "$lib/tools/Modal.svelte";
	import ConfirmLeave from "$lib/modals/ConfirmLeave.svelte";
    import { client } from "$lib/stores/client";
	
	export let itself: any;
	export let chatRoom: ChattRoom;

	let confirmLeaveModal: any;

	let isPrivate: boolean = chatRoom.is_private;
	let withPassword: boolean = chatRoom.is_password_protected;
	let password: string = (withPassword) ? "default-password" : "";

	let original = [isPrivate, withPassword, password];
	let modified: boolean = false;
	$: modified = !original.every((v, i) => { return v === Array(isPrivate, withPassword, password)[i]});

</script>

<Modal bind:this={confirmLeaveModal} closeOnBgClick={false}>
	<ConfirmLeave itself={confirmLeaveModal} settingModal={itself} />
</Modal>

<div class="vflex window settings">
	<h1>Settings</h1>
	<div class="flex private">
		<input type="radio" id="private" bind:group={isPrivate} name="isPrivate" value={true}>
		<label for="private">Private</label>
		<input type="radio" id="public" bind:group={isPrivate} name="isPrivate" value={false}>
		<label for="public">Public</label>
	</div>
	<div class="flex password">
		<input type="radio" id="with" bind:group={withPassword} name="withPassword" value={true}>
		<label for="with">With Password</label>
		<input type="radio" id="without" bind:group={withPassword} name="withPassword" value={false}>
		<label for="without">Without Password</label>
	</div>
	<div class="input">
		{#if (withPassword)}
		<input type="password" placeholder="Password" bind:value={password}>
		{:else}
		<div class="empty"></div>
		{/if}
	</div>
	<div class="flex buttons">
		<button on:click={() => {
			if (!modified)
				itself.close();
			confirmLeaveModal.open();
		}}>Close</button>
		<button class="{(modified) ? "" : "no-active"}" on:click={() => {
			//if (original[0] != isPrivate)
				$client.socket.emit((isPrivate) ? "set_room_private" : "unset_room_private", { id_public_room: chatRoom.roomID });
			if (original[1] != withPassword)
				$client.socket.emit((withPassword) ? "set_password_room" : "unset_password_room",
					(withPassword) ? { id_public_room: chatRoom.roomID, password: password } 
						: { id_public_room: chatRoom.roomID });
			else if (original[1] = true && password != "default-password")
				$client.socket.emit("set_password_room", { id_public_room: chatRoom.roomID, password: password });
			modified = false;
		}}>Save</button>
	</div>
</div>