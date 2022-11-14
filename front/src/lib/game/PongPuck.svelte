<style>
	.puck {
		position: absolute;
		margin: 0;

		z-index: 1;
		width: 30px;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		background-color: #fff;
		box-shadow: 0px 0px 10px 10px green;

	}
</style>

<script lang="ts">
	export let posX: number;
	export let posY: number;
</script>

<div class="puck"
	style="top: {posX}px; left: {posY}px;">
</div>