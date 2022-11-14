<style lang="scss">
	.container {
		background-color: #212121;
		border: 2px solid transparentize(#fff, .6);
		border-radius: .2em;

		width: 360px;
		height: 540px;
		padding: 2em;
		
		color: #fff;

		.friends {
			overflow: scroll;
			display: flex;
			flex-direction: column;

			width: 100%;
			height: 80%;
			border: none;
		}

		.no-friend {
			padding-top: 2em;
			height: 80%;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}
</style>

<script lang="ts">
    import { client } from "$lib/stores/client";
    import { onMount } from "svelte";

	let friends: Array<any>

	onMount(() => {
		$client.socket.emit();

		$client.socket.on();
	});
</script>

<div class="container">
	<h2>Friends</h2>
	{#if friends}
	<div class="friends">
		{#each friends as friend}
		<div class="friend">friend.username</div>
		{/each}
	</div>
	{:else}
	<div class="no-friend">
		<p>You don't have friends yet</p>
	</div>
	{/if}
</div>