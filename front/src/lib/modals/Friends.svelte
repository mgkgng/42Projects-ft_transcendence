<style lang="scss">
	.friends {
		width: 360px;
		height: 540px;

		.friends-list {
			padding-top: 2em;
			padding-left: .5em;
			gap: 1em;
			overflow: scroll;
			display: flex;
			flex-direction: column;


			width: 100%;
			height: 80%;
			border: none;

			.friend {
				width: 60%;
				cursor: pointer;
				border-radius: .2em .2em 3em .2em;
				transition: .3s;
				padding: 1em;

				&:hover {
					background-color: transparentize(#fff, .6);
				}
			}
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

	onMount(async () => {
		await fetch('http://localhost:3000/getfriendlist?username=min-kang').then(data => {
			return data.json();
		}).then(post => { friends = post; });

		$client.socket.emit();
		$client.socket.on();
	});
</script>

<div class="window friends">
	<h2>Friends</h2>
	{#if friends}
	<div class="friends-list">
		{#each friends as friend}
		<div class="friend">{friend.username}</div>
		{/each}
	</div>
	{:else}
	<div class="no-friend">
		<p>You don't have friends yet</p>
	</div>
	{/if}
	<CloseButton window={itself} />
</div>