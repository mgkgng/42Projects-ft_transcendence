<style lang="scss">
	.buttons {
		gap: 3em;

		button {
			width: 140px;
			aspect-ratio: 1 / 1;
			border-radius: 50%;
			cursor: pointer;
			color: #e6e6e6;
			backdrop-filter: (6px);
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
	import { onMount } from "svelte";
    import { user } from "$lib/stores/user";
    import Modal from "$lib/tools/Modal.svelte";
	import AlertMessage from "$lib/modals/AlertMessage.svelte";

	export let itself: any;
	export let createGameModal: any;
	export let joinGameModal: any;

	let messageModal: any;
	let modalMessage: string;

	let loading = false;

	onMount(() => {
		// console.log(client);
		
		$client.socket.on("JoinQueueError", (data: any) => {
			loading = false;
			modalMessage = data;
			messageModal.open();
		});

		return (() => {
			if (loading)
				$client.socket.emit("LeaveQueue");
			$client.socket.off("JoinQueueError");
		});
	})
</script>

<Modal bind:this={messageModal}>
	<AlertMessage itself={messageModal} msg={modalMessage}/>
</Modal>

<div class="flex buttons">
	<button class="join" on:click={()=>{
		joinGameModal.open();
		itself.close();
	}}>Join Room</button>
	<button class="create" on:click={()=>{
		createGameModal.open();
		itself.close();
	}}>Create Game</button>
	<button class="random {loading && "loading"}" on:click={()=>{
		$client.socket.emit((!loading) ? "JoinQueue" : "LeaveQueue");
		loading = !loading;
	}}>{(!loading) ? "Random Match" : ""}</button>
</div>