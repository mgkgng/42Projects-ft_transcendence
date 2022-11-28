<style lang="scss">
	.settings {
		width: 450px;
		height: 320px;
		justify-content: space-around;
		align-items: center;

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

	export let itself: any;
	export let chatRoom: ChattRoom;

	let confirmLeaveModal: any;

	let isPrivate: boolean = chatRoom.is_private;
	let withPassword: boolean = chatRoom.is_password_protected;

	let modified: boolean = false;
</script>

<Modal bind:this={confirmLeaveModal} closeOnBgClick={false}>
	<ConfirmLeave itself={confirmLeaveModal} settingModal={itself} />
</Modal>

<div class="vflex window settings">
	<h1>ChatRoom Settings</h1>
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


	<!-- {#if chatRoom.is_password_protected}
	<input class="button" value="delete password" on:click={unset_password_room}>
	<input class="button" value="Change password" on:click={set_password_room}>
	{:else}
	<input class="button" value="add password" on:click={set_password_room}>
	{/if} -->

	<div class="flex buttons">
		<button on:click={() => {
			if (!modified)
				itself.close();
			confirmLeaveModal.open();
		}}>Cancel</button>
		<button class="{(modified) ? "" : "no-active"}" on:click={() => {

		}}>Save</button>
	</div>
</div>