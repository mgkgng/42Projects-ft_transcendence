<style lang="scss">
	.circles {
		position: absolute;
		top: 50%;
		left: 50%;
		width: var(--width);
		height: var(--width);
		transform: translate(-50%, -50%);

		.main-circle {
			position: absolute;
			left: -10%;
			width: var(--width);
			background-color: #000;
			aspect-ratio: 1 / 1;
			border-radius: 50%;
		
			box-shadow: 0px 0px 750px 100px $main;
		}
		
		.shadow {
			position: absolute;
	
			left: 15%;
			width: var(--width);
			background-color: $submain;
			aspect-ratio: 1 / 1;
			border-radius: 50%;
		
			box-shadow: 0px 0px 450px 60px $submain;
		}

		@keyframes show-msg {
		0% { color: #000 }
		50% { transform: #fff }
		100% { transform: #000 }
	}
	}

</style>

<script lang="ts">
	export let circleRadius: number;

</script>

<div class="circles" style="--width: {circleRadius * 2}px">
	<div class="shadow"></div>
	<div class="main-circle"></div>
</div>