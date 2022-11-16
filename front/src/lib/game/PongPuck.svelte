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
	export let posX: number;
	export let posY: number;
</script>

<div class="puck"
	style="top: {posX}px; left: {posY}px;">
</div>