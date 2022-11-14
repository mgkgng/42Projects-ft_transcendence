<style lang="scss">
	.friends {
		width: 360px;
		height: 540px;

		.friends-list {
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
    import CloseButton from "$lib/items/CloseButton.svelte";
	import { client } from "$lib/stores/client";
    import { onMount } from "svelte";

	export let itself: any;

	let friends: Array<any>

	onMount(() => {
		$client.socket.emit();

		$client.socket.on();
	});
</script>

<div class="window friends">
	<h2>Friends</h2>
	{#if friends}
	<div class="friends-list">
		{#each friends as friend}
		<div class="friend">friend.username</div>
		{/each}
	</div>
	{:else}
	<div class="no-friend">
		<p>You don't have friends yet</p>
	</div>
	{/if}
	<CloseButton window={itself} />
</div>