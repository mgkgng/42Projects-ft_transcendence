<style>
	.puck {
		position: relative;
		margin: 0;

		z-index: 2;
		width: 30px;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		background-color: blue;
	}
</style>

<script lang="ts">
	export let posX: number;
	export let posY: number;
</script>

<div class="puck"
	style="top: {posX}px; left: {posY}px;">
</div>