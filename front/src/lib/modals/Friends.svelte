<style lang="scss">
	.friends {
		width: 360px;
		height: 480px;
		padding-bottom: .2em;
		padding-right: .5em;
		justify-content: space-between;

		.friends-list {
			margin-top: 1em;
			padding-left: .2em;
			gap: .8em;
			overflow-y: scroll;

			width: 100%;
			height: 80%;
			border: none;

			.line {
				position: relative;

				.friend {
					width: 60%;
					cursor: pointer;
					border-radius: .2em .2em 3em .2em;
					transition: .3s;
					padding: 1em;

					&:hover {
						background-color: transparentize($main-light, .3);
						filter: saturate(50%);
					}
				}
				.tools {
					position: absolute;
					right: 2em;
					width: 7em;
					float: right;
					justify-content: flex-end;
					gap: 2em;

					padding: 1em;
					border-radius: 3em .2em .2em .2em;
					cursor: pointer;

					img {
						height: 1.2em;
					}

					button {
						cursor: pointer;
					}

					&:hover {
						background-color: transparentize($submain-lowshadeblue, .3);
						filter: saturate(50%);
					}
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

	onMount(() => {
		$client.socket.emit("getFriendList");

		$client.socket.on("error_getFriendList", (data: any) => {
			console.log("Error!");
		});

		$client.socket.on("success_getFriendList", (data: any) => {
			console.log(data);
		})
	});
</script>

<div class="window friends">
	<h2>Friends</h2>
	{#if friends}
	<div class="vflex friends-list">
		{#each friends as friend}
		<div class="flex line">
			<div class="friend">{friend.username}</div>
			<div class="flex tools">
				<button><img src="/icon-mail.png" alt="mail"></button>
				<button>-</button>
			</div>
		</div>
		{/each}
	</div>
	{:else}
	<div class="no-friend">
		<p>You don't have friends yet</p>
	</div>
	{/if}
	<CloseButton window={itself} />
</div>