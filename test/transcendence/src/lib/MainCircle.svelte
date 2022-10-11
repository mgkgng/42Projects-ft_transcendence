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
		// box-shadow: 20px 50px 20px 20px $main;

	}

	.shadow {
		position: absolute;
		width: var(--width);
		background-color: rgba(0, 0, 0,0 );
		aspect-ratio: 1 / 1;
		border-radius: 50%;

		display: flex;
		justify-content: center;
		align-items: center;

		// box-shadow: 0px 0px 240px 30px $main;
		// box-shadow: 0px 0px 550px 50px $main;
		// box-shadow: 0px 0px 750px 100px $main;
		box-shadow: 5px -5px 5px 5px rgb(49, 211, 240); //maybe?
	}
</style>

<script lang="ts">
	export let circleRadius: number;

</script>

<div class="shadow" style="--width: {circleRadius * 2}px"></div>
<div class="main-circle" style="--width: {circleRadius * 2}px"></div>