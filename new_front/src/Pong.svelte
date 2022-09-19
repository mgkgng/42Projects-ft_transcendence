<style lang="scss">
	.bar {
		width: 10px;
		height: 3px;
		background-color: $bar;
	}
</style>

<script>
	function handleKey(e) {
		console.log(e);
	}	
</script>

<div class="bar" on:keydown={handleKey}></div>