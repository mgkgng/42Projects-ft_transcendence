<style lang="scss">
	.messages {
		width: 720px;
		height: 560px;
		padding: 0;

		.from {
			width: 30%;
			height: 100%;
			border-right: $border;

			padding: 1.5em .5em;

			overflow-y: overlay;
			cursor: pointer;

			.line {
				width: 100%;
				height: 4em;
				border-bottom: $border-thin;
				border-radius: .3em;
				align-items: center;
				transition: .2s;

				&:hover { background-color: transparentize(#fff, .6); }

				img {
					width: 45px;
					height: 45px;
					border-radius: 50%;
					margin-left: .5em;
					object-fit: cover;
				}
			}

			
		}

		.chat {
			width: 70%;
			height: 100%;
		}

		.no-selected {
			width: 70%;
			height: 100%;

			justify-content: center;
			align-items: center;
		}

		.no-users {
			width: 100%;
			height: 100%;

			justify-content: center;
			align-items: center;

			font-size: 24px;
		}
	}
</style>

<script lang="ts">
    import CloseButton from "$lib/items/CloseButton.svelte";

	export let itself: any;

	let users: Array<any> = [{
		username: "min-kang",
		img: "pingu/pingu-angry.jpeg",
	}, {
		username: "hmm",
		img: "pingu/pingu-coucou.jpeg"
	}];

	let selected: string = "";
</script>

<div class="flex window messages">
	{#if users.length}
		<div class="from">
			{#each users as user}
			<div class="flex line" on:click={() => { selected = user.username; }}>
				<img src="{user.img}" alt="from">
				<p>{user.username}</p>
			</div>
			{/each}
		</div>
		{#if selected.length}
		<div class="chat">
		</div>
		{:else}
		<div class="flex no-selected">
			<p>Please select a message</p>
		</div>
		{/if}
	{:else}
		<div class="flex no-users">
			<p>You don't have any message yet.</p>
		</div>
	{/if}
	<CloseButton window={itself} />
</div>