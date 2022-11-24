<style lang="scss">
	.puck {
		position: absolute;
		margin: 0;

		z-index: 1;
		width: 15px;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		background-color: $red;

	}
</style>

<script lang="ts">
	export let pos: Array<number>;
</script>

<div class="puck"
	style="top: {pos[0]}px; left: {pos[1]}px;">
</div>