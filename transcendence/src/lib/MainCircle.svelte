<style lang="scss">
	.main-circle {
		position: relative;
		width: var(--width);
		background-color: #000;
		aspect-ratio: 1 / 1;
		border-radius: 50%;

		display: flex;
		justify-content: center;
		align-items: center;

		// box-shadow: 0px 0px 240px 30px $main;
		// box-shadow: 0px 0px 550px 50px $main;
		box-shadow: 0px 0px 750px 100px $main;
	}
</style>

<script>
	export let circleRadius;

</script>

<div class="main-circle" style="--width: {circleRadius * 2}px">
</div>