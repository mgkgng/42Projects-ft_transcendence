<style lang="scss">
	.puck {
		position: absolute;
		margin: 0;

		z-index: 55;
		width: 14px;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		background-color: rgb(220, 215, 229);
		box-shadow: 0px 0px 6px 10px rgb(147, 117, 202);

	}
</style>

<script lang="ts">
	export let posX: number;
	export let posY: number;
</script>

<div class="puck"
	style="top: {posY}px; left: {posX}px;">
</div>