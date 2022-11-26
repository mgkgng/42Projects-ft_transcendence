<style lang="scss">
	.rank {
		width: 640px;
		height: 800px;

		padding: 1.5em 2em;

		align-items: center;

		.list {
			width: 100%;
			height: 90%;

			border: $border;
			border-radius: .4em;

			overflow-y: scroll;
		}
	}
</style>

<script lang="ts">
	import { onMount } from "svelte";
    import { client } from "$lib/stores/client";
    import { user } from "$lib/stores/user";

	export let itself: any;
	
	let rankList: Array<any> = [];

	onMount(() => {
		$client.socket.emit("RankingReq");

		$client.socket.on("RankingRes", (data: any) => {
			rankList = data;
		});
	});
</script>

<div class="vflex window rank">
	<h1>Global Ranking</h1>
	<h3>You are situated at</h3>
	<div class="vflex list">

	</div>
</div>