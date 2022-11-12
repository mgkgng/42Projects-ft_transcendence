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
		background-color: transparentize($submain, 0.9);
		backdrop-filter: blur(6px);
		border: 2px solid;
		text-align: center;
		font-size: 25px;
		display: flex;
		justify-content: center;
		align-items: center;

		transition: .2s;

		&:hover {
			transform: translateY(-10px);
		}
	}
</style>

<script lang="ts">
    import { client } from "$lib/stores/client";
   
	export let itself: any;
	export let createGameModal: any;
	export let roomListModal: any;

	let loading = false;
</script>

<div class="container">
	<div class="button" on:click={()=>{
		roomListModal.open();
		itself.close();
	}}>Join Room</div>
	<div class="button" on:click={()=>{
		createGameModal.open();
		itself.close();
	}}>Create Game</div>
	<div class="button {loading && "loading"}" on:click={()=>{
		$client.socket.emit((!loading) ? "JoinQueue" : "LeaveQueue", $client.id);
		loading = !loading;
	}}>{(!loading) ? "Random Match" : ""}</div>
</div>