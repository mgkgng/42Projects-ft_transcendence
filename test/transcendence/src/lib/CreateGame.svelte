<style lang="scss">
	.container {
		width: 100%;
		height: 100%;
	}

	.box {
		display: flex;
		flex-direction: column;
		gap: 2em;

		align-items: center;
	}

	.line {
		display: flex;
		flex-direction: row;

		gap: 3em;
	}

	button {
		cursor: pointer;
	}
</style>

<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
	import { client } from "./stores/client";

	let mapType: number = 0;
	let maxPoint: number = 10;
	let difficulty: number = 1;


	onMount(() => {
		$client.addListener("RoomCreated", (data: any) => {
			goto('/play/' + data);
		});

		return ($client.removeListener("RoomCreated"));
	});
</script>

<div class="container">
	<div class="box">
		<div class="line">
			<p>Map Type</p>
			<button on:click={()=>{ if (mapType > 0) mapType--; }}>&#8595;</button>
			<p>{mapType + 1}</p>
			<button on:click={()=>{ if (mapType < 3) mapType++; }}>&#8593;</button>

		</div>
		<div class="line">
			<p>Max Point</p>
			<button on:click={()=>{ if (maxPoint > 0) maxPoint--; }}>&#8595;</button>
			<p>{maxPoint}</p>
			<button on:click={()=>{ if (maxPoint < 20) maxPoint++; }}>&#8593;</button>
	
		</div>
		<div class="line">
			<p>Difficulty</p>
			<button on:click={()=>{ if (difficulty > 0) difficulty--; }}>&#8595;</button>
			<p>{difficulty}</p>
			<button on:click={()=>{ if (difficulty < 3) difficulty++; }}>&#8593;</button>
		</div>

		<button on:click={()=>{
			$client.sock.send(JSON.stringify({
				event: "CreateRoom",
				data: {
					mapType: mapType,
					maxPoint: maxPoint,
					difficulty: difficulty
				}
			}));
		}}>Submit</button>
	</div>
	
</div>