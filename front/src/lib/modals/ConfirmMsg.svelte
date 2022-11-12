<style lang="scss">
	.container {
		width: 25em;
		height: 8em;

		background-color: transparentize(grey, 0.5);
		border: solid 2px transparentize(#fff, 0.65);

		color: #fff;

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		gap: 1em;
		border-radius: .3em;
	}

	.buttons {
		display: flex;
		flex-direction: row;

		gap: .5em;
	}

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

</style>

<script lang="ts">
	export let msg: string;
	export let result: boolean;
	export let itself: any;
</script>

<div class="container">
	<p>{msg}</p>
	<div class="buttons">
		<button class="cancel" on:click={()=>{
			result = false;
			itself.close();
		}}>Cancel</button>
		<button class="quit" on:click={()=>{
			result = true;
			itself.close();
		}}>Quit</button>
	</div>
</div>