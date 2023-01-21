<style lang="scss">
	.invitation {
		width: 360px;
		height: 180px;
		gap: .2em;
		justify-content: space-around;
		align-items: center;

		.msg {
			width: 100%; 
			text-align: center;
		}
		.buttons {
			justify-content: center;
			align-items: center;
			gap: 0.2em;

			button {
				width: 5em;
				height: 2.5em;
				border-radius: .4em;
				background-color: $red;
				&:first-child {
					background-color: $green;
				}

				&:hover { filter: brightness(70%); }

			}
		}
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';
    import { client } from '$lib/stores/client';

	export let roomID: string;
	export let itself: any;

</script>

<div class="vflex window invitation">
	<div class="msg">
		<p>The game is successfully created!</p>
		<p>Do you want to join the game?</p>
	</div>
	<div class="flex buttons">
		<button on:click={() => {
			$client.socket.emit("JoinRoom", {
				roomID: roomID,
				play: true
			});
		}}>Join</button>
		<button on:click={() => { itself.close(); }}>Close</button>
	</div>
</div>