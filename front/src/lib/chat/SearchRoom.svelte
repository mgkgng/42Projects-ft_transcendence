<style lang="scss">
	.rooms {
		width: 550px;
		height: 550px;

		.research {
			justify-content: center;
			align-items: center;
			gap: .5em;

			input {
				border-radius: .2em;
				width: 15em;
				height: 1.5em;
				background-color: #fff;
				color: #000;
				padding-left: .4em;
			}
			button {
				height: 1.2em;
			}
		}

		.result {
			width: 100%;
			height: 80%;
			overflow-y: scroll;
			gap: .2em;

			.list {
				position: relative;
				height: 3em;
				border: $border-thin;
				border-radius: .3em;
				align-items: center;
				padding-left: 1em;

				button {
					width: 4em;
					height: 100%;
					position: absolute;
					right: 0;
					border-left: $border-thin;
					background-color: transparentize(#fff, .9);
					transition: .2s;
					&:hover {
						background-color: $submain-lowshadeblue;
					}
				}

				&:hover {
				background-color: transparentize(#fff, .8);
				}
			}
		}
	}

	
	.back{
		padding: 0em;
		width: 50px;
		height: 50px;
		margin-right: 1em;
		border-radius: 0.5em;
		color:rgb(255, 255, 255);
		text-align: center;
		background-color: rgba(97, 97, 97, 0.5);
		cursor: pointer;
	}

	.research-zone{
		display: flex;
		flex-direction: row;
		padding: 0.2em;
		margin: 0.5em;
		height: 40px;
	}
</style>

<script lang="ts">

    import { client } from "$lib/stores/client";
	import { onMount, beforeUpdate } from "svelte";
    import { Chat } from "$lib/chatt/Chat";
    import RoomPassword from "$lib/chat/RoomPassword.svelte";
    import Modal from "$lib/tools/Modal.svelte";
	
	export let itself: any; 
	export let chat: Chat;

	let passwordModal: any;

	let research : string = "";
	let searchResult: Array<string> = [];

	let roomName: string = "";

	$: $client.socket.emit("get_all_rooms_begin_by", { research: research });

	onMount(() => {
		console.log("ccc", [...chat.rooms.keys()].sort());
		console.log("ttt", chat.my_rooms);
		$client.socket.on("get_all_rooms_begin_by_res", (data: any) => {
			console.log("test", data);
		});

		return (() => { $client.socket.off("get_all_rooms_begin_by_res"); });
	});

</script>

<Modal bind:this={passwordModal}>
	<RoomPassword itself={passwordModal} roomName={roomName}/>
</Modal>

<div class="vflex window rooms">
	<div class="flex research">
		<input class="text-input" placeholder="Search Room Name ..." bind:value={research}>
	</div>
	<div class="vflex result">
		{#each ([...chat.rooms.keys()].sort()) as room_name}
			{#if (!chat.my_rooms.includes(room_name))}
				<div class="flex list">
					<p>{room_name}</p>
					<button on:click={() => {
						if (chat.rooms.get(room_name).is_password_protected) {
							roomName = room_name;
							passwordModal.open();
						} else
							$client.socket.emit("append_user_to_room", {room_name: room_name, room_password: ""});
					}}>Join</button>
				</div>
			{/if}
		{/each}
	</div>
</div>