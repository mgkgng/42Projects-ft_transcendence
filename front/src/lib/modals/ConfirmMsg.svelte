<style lang="scss">
	.container {
		width: 15em;
		height: 8em;

		background-color: transparentize(grey, 0.5);

		color: #fff;
	}

	button {
		width: 5em;
		height: 3em;
	}
</style>

<script lang="ts">

	export let msg: string;
	export let result: boolean;
</script>

<div class="container">
	<p>{msg}</p>
	<div class="buttons">
		<button class="yes" on:click={()=>{result = false}}>Y</button>
		<button class="no" on:click={()=>{result = true}}>N</button>
	</div>
</div>