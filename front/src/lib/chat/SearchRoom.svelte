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

			.room {
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
    import { Chatt } from "$lib/chatt/Chatt";
    import RoomPassword from "$lib/chat/RoomPassword.svelte";
    import Modal from "$lib/tools/Modal.svelte";
    import CloseButton from "$lib/items/CloseButton.svelte";
	
	export let itself: any; 
	export let chat: Chatt;

	let passwordModal: any;

	let research: string = "";
	let researchTrigger: string = research;

	let allRooms: Array<any> = [];
	let roomID: string = "";

	let loading: boolean = true;

	$: {
		if (researchTrigger != research) {
			$client.socket.emit("get_all_rooms_begin_by", { research: research });
			loading = true;
			researchTrigger = research;
		}
	}

	onMount(() => {
		$client.socket.on("success_append_user_to_room", (data: any) => {
			console.log("success", data);
		});

		$client.socket.on("get_all_rooms_begin_by_res", (data: any) => {
			console.log("test", data);
			allRooms = data;
			allRooms.sort((a: any, b: any) => {
				return (b.nb_users - a.nb_users || a.name - b.name || a.id_public_room - b.id_public_room);
			});
			loading = false;
		});

		$client.socket.emit("get_all_rooms_begin_by", { research: "" });

		return (() => {
			$client.socket.off("success_append_user_to_room");
			$client.socket.off("get_all_rooms_begin_by_res");
		});
	});

</script>

<Modal bind:this={passwordModal}>
	<RoomPassword itself={passwordModal} roomID={roomID}/>
</Modal>

<div class="vflex window rooms">
	<div class="flex research">
		<input class="text-input" placeholder="Search Room Name ..." bind:value={research}>
	</div>
	{#if !loading}
	<div class="vflex result">
		{#each allRooms as room}
		{#if (!chat.my_rooms.has(room.id_public_room))}
			<div class="flex room">
				<p>{room.name}</p>
				<button on:click={() => {
					if (room.is_password_protected) {
						roomID = room.id_public_room;
						passwordModal.open();
					} else
						$client.socket.emit("append_user_to_room", {id_public_room: room.id_public_room, room_password: ""}); // TODO
				}}>Join</button>
			</div>
		{/if}
		{/each}
	</div>
	{:else}
	<div class="result loading">Loading...</div>
	{/if}
	<CloseButton window={itself}/>
</div>