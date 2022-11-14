<style lang="scss">
	button {
		position: absolute;
		top: 0;
		right: .3em;

		width: 20px;
		height: 30px;
		color: #fff;
		cursor: pointer;

		padding: .2em;
		padding-bottom: .5em;
		border-radius: 0 0 .3em .3em;

		transition: .2s;

		&:hover {
			// background-color: transparentize($red, .4);
			background-color: transparentize(#fff, .8);
			color: #d9d9d9;
		}
	}
</style>

<script lang="ts">
	export let window: any;
</script>

<button on:click={() => { window.close(); }}>x</button>