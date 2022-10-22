<style lang="scss">
	.container {
		width: 100%;
		height: 100%;
		font-family: sans-serif; // for now
		font-size: 19px;

		color: #fff;
	}

	.box {
		display: flex;
		flex-direction: column;
		gap: 2em;

		align-items: center;
		justify-content: center;
	}

	.line {
		display: flex;
		flex-direction: row;

		gap: 3em;
	}

	button {
		padding: 2em;
		border-radius: 2em;
		background-color: transparentize($main, 0.3);
		color: #fff;
		cursor: pointer;
	}

	.text-input {
		background-color: #fff;
		color: #000;
	}
</style>

<script lang="ts">
	import { client } from "../stores/client";

	let maxPoint: number = 10;
	let difficulty: number = 3;
	let mapType: number = 2;
	let privateMode: boolean = false;
	let roomTitle: string = "Hello World!";

</script>

<div class="container">
	<div class="box">
		<label>
			Title:
			<input class="text-input" bind:value={roomTitle}>
		</label>

		<label>
			<input type=radio bind:group={mapType} name="mapType" value={1}> Map 1
			<input type=radio bind:group={mapType} name="mapType" value={2}> Map 2
			<input type=radio bind:group={mapType} name="mapType" value={3}> Map 3
		</label>

		<label>
			Max Point: 
			<input type=number bind:value={maxPoint} min=0 max=20>
			<input type=range bind:value={maxPoint} min=0 max=20>
		</label>

		<label>
			Difficulty: 
			<input type=number bind:value={difficulty} min=1 max=5>
			<input type=range bind:value={difficulty} min=1 max=5>
		</label>

		<label>
			<input type=radio bind:group={privateMode} name="privateMode" value={false}> Public
			<input type=radio bind:group={privateMode} name="privateMode" value={true}> Private
		</label>

		<button on:click={()=>{
			$client.socket.emit("CreateRoom", {
				client: $client.id,
				title: roomTitle,
				mapType: mapType,
				maxPoint: maxPoint,
				difficulty: difficulty,
				privateMode: privateMode
			});
		}}>Create Game</button>
	</div>
	
</div>