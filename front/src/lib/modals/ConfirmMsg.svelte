<style lang="scss">
	.container {
		width: 25em;
		height: 8em;

		background-color: transparentize(grey, 0.5);
		border: solid 2px transparentize(#fff, 0.65);

		color: #fff;

		justify-content: center;
		align-items: center;

		border-radius: .3em;

		.buttons {
			gap: .5em;
	
			button {
				width: 5em;
				height: 3em;
				border-radius: .2em;
				cursor: pointer;
		
				&:hover {
					filter: brightness(80%);
				}
			}
			
			.cancel { background-color: $green; }
			.quit { background-color: $red; }
		}
	}


</style>

<script lang="ts">
    import { client } from "$lib/stores/client";

	export let msg: string;
	export let toQuit: any;
	export let roomId: string;
	export let itself: any;
</script>

<div class="vflex container">
	<p>{msg}</p>
	<div class="flex buttons">
		<button class="cancel" on:click={()=>{
			itself.close();
		}}>Cancel</button>
		<button class="quit" on:click={()=>{
			$client.socket.emit("ExitRoom", { roomId: roomId });
			toQuit.close();
		}}>Quit</button>
	</div>
</div>