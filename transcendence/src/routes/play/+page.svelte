<style>
	.div-container {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.game-container {
		width: 300px;
		height: 80px;
		border:  black;
		
	}

	.central-line {
		position: absolute;
		top: 400px;
		width: 500px;
		height: 0;
		border: dashed 3px rgba(0, 0, 0, .7);
	}
</style>

<script>
	import Bar from "$lib/Bar.svelte";
	import client
</script>

<div class="div-container">
	<div class="game-container">
		
	</div>

	<div class="central-line"></div>
	<Bar />

</div>