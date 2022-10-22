<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		gap: 0;
		margin: 0;
		width: 500px;
		background-color: transparentize(#fff, 0.5);
	}
	
	.photo-zone {
		width: 100%;
		min-height: 200px;

		img {
			width: 100%;
		}
	}

	.tool-zone {
		width: 100%;
		min-height: 100px;
	}

	.history-zone {
		width: 100%;
		min-height: 200px;
	}
</style>

<script lang="ts">

</script>

<div class="container">
	<div class="photo-zone">
		<img src="/pingu/pingu-angry.jpeg" alt="pingu-angry">
	</div>
	<div class="tool-zone">
		tool here
	</div>
	<div class="history-zone">
		history here
	</div>
</div>