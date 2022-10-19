<style lang="scss">
	.container {
		width: 100%;
		height: 100%;
		font-family: sans-serif; // for now
		font-size: 19px;
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
</style>

<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { identity } from "svelte/internal";
    import Bar from "./Bar.svelte";
	import { client } from "./stores/client";

	let maxPoint: number = 10;
	let difficulty: number = 3;
	let mapType: number = 2;
	let privateMode: boolean = false;

</script>

<div class="container">
	<div class="box">

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
			$client.sock.send(JSON.stringify({
				event: "CreateRoom",
				data: {
					client: $client.id,
					mapType: mapType,
					maxPoint: maxPoint,
					difficulty: difficulty,
					privateMode: privateMode
				}
			}));
		}}>Create Game</button>
	</div>
	
</div>