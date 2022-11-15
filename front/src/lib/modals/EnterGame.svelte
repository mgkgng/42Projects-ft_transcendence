<style lang="scss">
	.buttons {
		gap: 3em;

		button {
			width: 140px;
			aspect-ratio: 1 / 1;
			border-radius: 50%;
			cursor: pointer;
			color: #e6e6e6;
			backdrop-filter: blur(6px);
			border: $border;
			text-align: center;
			font-size: 25px;
			display: flex;
			justify-content: center;
			align-items: center;
	
			transition: .2s;
	
			&:hover {
				filter: brightness(85%);
				transform: translateY(-5px); }
			}

		.join { background-color: $main-light; }
		.create { background-color: $submain-lowshadeblue; }
		.random { background-color: $main-lowshade; }

	}
	
</style>

<script lang="ts">
    import { client } from "$lib/stores/client";
   
	export let itself: any;
	export let createGameModal: any;
	export let roomListModal: any;

	let loading = false;
</script>

<div class="flex buttons">
	<button class="join" on:click={()=>{
		roomListModal.open();
		itself.close();
	}}>Join Room</button>
	<button class="create" on:click={()=>{
		createGameModal.open();
		itself.close();
	}}>Create Game</button>
	<button class="random {loading && "loading"}" on:click={()=>{
		$client.socket.emit((!loading) ? "JoinQueue" : "LeaveQueue", $client.id);
		loading = !loading;
	}}>{(!loading) ? "Random Match" : ""}</button>
</div>