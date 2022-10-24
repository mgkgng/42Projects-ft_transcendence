<style lang="scss">
	.container {
		display: flex;
		flex-direction: row;
		gap: 3em;
	}
	.button {
		width: 140px;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		overflow: hidden;
		cursor: pointer;
		color: #e6e6e6;
		background-color: transparentize(#fff, 0.9);
		backdrop-filter: blur(6px);
		border: 2px solid;
		text-align: center;
		font-size: 25px;
		display: flex;
		justify-content: center;
		align-items: center;

		transition: transform .2s;

		&:hover {
			transform: translateY(-10px);
		}
	}
</style>

<script lang="ts">
    import { client } from "$lib/stores/client";
    import Modal from "$lib/tools/Modal.svelte";
    import CreateGame from "$lib/modals/CreateGame.svelte";
    import RoomList from "$lib/modals/RoomList.svelte";

	let createGameModal: any;
	let roomListModal: any;

</script>

<Modal bind:this={createGameModal} closeOnBgClick={true}>
	<CreateGame />
</Modal>

<Modal bind:this={roomListModal} closeOnBgClick={true}>
	<RoomList />
</Modal>

<div class="container">
	<div class="button" on:click={()=>{ roomListModal.open(); }}>Join Room</div>
	<div class="button" on:click={()=>{ createGameModal.open(); }}>Create Game</div>
	<div class="button" on:click={()=>{ $client.socket.emit("JoinQueue", {data: $client.id}); }}>Random Match</div>
</div>