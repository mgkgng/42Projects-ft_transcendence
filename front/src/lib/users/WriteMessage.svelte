<style lang="scss">
	.write {
		width: 640px;
		height: 320px;
		border: $border;
		border-radius: .3em;
		padding: 2em 2em;
		gap: .5em;

		.send-to {
			width: 100%;
			height: 25%;
			border: $border-thin;
			border-radius: .3em;
		}
		.content {
			width: 100%;
			height: 75%;
			position: relative;
			border: $border-thin;
			border-radius: .3em;

			input {
				width: 100%;
				height: 100%;
				padding: 1em .6em;
			}
			button {
				position: absolute;
				right: 0;
				bottom: 0;
			}
		}
	}
</style>

<script lang="ts">
    import { client } from "$lib/stores/client";

	export let itself: any;
	export let sendTo: Array<string>;

	let message: string = "";
	let errorMessage: string = "";
</script>

<div class="vflex window write">
	<div class="vflex send-to">

	</div>
	<div class="content">
		<input type="text" placeholder="Write your message here..." bind:value={message}>
		<button on:click={() => {
			if (!sendTo.length) {
				errorMessage = "Please put anybody to whom you want to send a message."
				return ;
			} else if (!message.length) {
				errorMessage = "You cannot send an empty message!";
				return ;
			}
			for (let dest of sendTo)
				$client.socket.emit("sendDirectMessage", {
					username: dest,
					message: message
				});
		}}>Send</button>
	</div>
</div>