<style lang="scss">
	.main-circle {
		position: absolute;
		left: 34%;
		width: var(--width);
		background-color: #000;
		aspect-ratio: 1 / 1;
		border-radius: 50%;

		display: flex;
		justify-content: center;
		align-items: center;

		box-shadow: 0px 0px 750px 100px $main;
	}
	
	.shadow {
		position: absolute;

		left: 41%;
		width: var(--width);
		background-color: $submain;
		aspect-ratio: 1 / 1;
		border-radius: 50%;

		display: flex;
		justify-content: center;
		align-items: center;

		box-shadow: 0px 0px 450px 60px $submain;
	}
</style>

<script lang="ts">
	export let circleRadius: number;

</script>

<div class="shadow" style="--width: {circleRadius * 2}px"></div>
<div class="main-circle" style="--width: {circleRadius * 2}px"></div>