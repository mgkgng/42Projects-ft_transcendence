<style lang="scss">
	.container {
		max-height: 100%;
		background-color: rgba(0, 0, 0, 0);
		display: grid;
		grid-template-rows: 90vh 10vh;
		gap: 0;
		padding: 0;
	}

	.loading-box {
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.msg {
		color: #fff;
	}
</style>

<script lang="ts">
	import { page } from "$app/stores";
    import Room from "$lib/Room.svelte";
	import { client } from "$lib/stores/client";
    import Title from "$lib/Title.svelte";
    import { onMount } from "svelte";

	let roomId = $page.params.id;
	let roomFound: boolean = false;
	let roomNotFound: boolean = false;
	let roomInfo: any;

	function roomcheck() {
		$client.sock.send(JSON.stringify({
			event: 'RoomCheck',
			data: {
				client: $client.id,
				room: roomId
			}
		}));
	}

	onMount(() => {
		$client.OnConnection(roomcheck);

		$client.addListener("RoomNotFound", () => {
			console.log("RoomNotFound");
			roomNotFound = true;
		});

		$client.addListener("RoomInfo", (data: any) => {
			console.log("RoomInfo", data);
			roomFound = true;
			roomInfo = data.roomInfo;
		});

		return (() => {
			$client.removeOnConnection(roomcheck);
			$client.removeListeners(["RoomNotFound", "RoomInfo"]);
		});
	});
</script>

{#if roomFound}
<Room roomId={roomId} roomInfo={roomInfo}/>
{:else if !roomNotFound}
<div class="loading-box">
	<h1 class="msg">LOADING...</h1>
</div>
{:else}
<div class="container">
	<Title title={"not found"} mainPage={false}/>
</div>
{/if}