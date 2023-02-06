<style lang="scss">
	.rooms {
		width: 550px;
		height: 550px;

		.research {
			justify-content: center;
			align-items: center;
			gap: .2em;

			input {
				border-radius: .2em;
				width: 15em;
				height: 1.5em;
				background-color: #fff;
				color: #000;
				padding-left: .4em;
			}
			button {
				background-color: $submain-lowshadeblue;
				border-radius: .3em;
				width: 4em;
				height: 1.5em;

				&:hover { filter: brightness(85%); }
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

	let allRooms: Array<any> = [];
	let roomID: string = "";

	let loading: boolean = true;

	onMount(() => {
		$client.socket.on("success_append_user_to_room", (data: any) => {
			console.log("success_append_user_to_room", data);
			console.log("success_append_user_to_room", $client.username);
			if (data.username == $client.username)
		 		$client.socket.emit("get_my_rooms", {data : "some_data"});
			else
				$client.socket.emit("get_users_room", {id_public_room: data.id_public_room});
			itself.close();
		});

		$client.socket.on("get_all_rooms_begin_by_res", (data: any) => {
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
		<button on:click={() => {
			$client.socket.emit("get_all_rooms_begin_by", { research: research });
		}}>Search</button>
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
						$client.socket.emit("append_user_to_room", {id_public_room: room.id_public_room, username: $client.username, room_password: ""});
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