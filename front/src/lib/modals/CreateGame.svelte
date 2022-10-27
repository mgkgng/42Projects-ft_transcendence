<style lang="scss">
	.container {
		position: relative;
		width: 100%;
		height: 100%;
		font-size: 19px;

		padding: 5em;
		background-color: transparentize(#fff, 0.65);

		color: #fff;
		border: 2px solid #fff;
		border-radius: 5em;
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

	.submit {
		padding: 2em;
		border-radius: 2em;
		border: solid #fff;
		background-color: transparentize($main2, 0.8);
		color: #fff;
		cursor: pointer;
	}

	.text-input {
		background-color: #fff;
		color: #000;
	}

	.button-box {
		position: absolute;
		top: 0;
		left: 0;
		width: 5em;
		height: 100%;

		padding-top: 8em;
		padding-bottom: 8em;
		padding-left: 1em;
		padding-right: 1em;
	}

	.button-back {
		width: 100%;
		height: 100%;

		transition: .3s;
		border-radius: 2em;
		border: none;
		background-color: transparentize(#fff, 1);
		font-size: 25px;

		&:hover {
			display: block;
			background-color: transparentize($main2, 0.8);
		}
	}

</style>

<script lang="ts">
	import { client } from "$lib/stores/client";

	export let itself: any;
	export let enterGameModal: any;

	let maxPoint: number = 10;
	let difficulty: number = 3;
	let mapType: number = 2;
	let privateMode: boolean = false;
	let roomTitle: string = "Hello World!";

</script>

<div class="container">
	<div class="button-box">
		<button class="button-back" on:click={()=>{
			itself.close();
			enterGameModal.open();
		}}>&lt</button>
	</div>
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

		<button class="submit" on:click={()=>{
			$client.socket.emit("CreateRoom", {
				client: $client.id,
				title: roomTitle,
				mapType: mapType,
				maxPoint: maxPoint,
				difficulty: difficulty,
				privateMode: privateMode
			});
			itself.close();
		}}>Create Game</button>
	</div>
	
</div>