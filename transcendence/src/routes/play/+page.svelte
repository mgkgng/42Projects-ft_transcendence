<style lang="scss">
	.div-container {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.game-container {
		width: 300px;
		height: 80px;
		border:  black;
		
	}

	.bar-container {
		position: absolute;

		.above {
			top: 20px;
		}

		.below {
			bottom: 20px;
		}
	}

	.central-line {
		position: absolute;
		top: 400px;
		width: 500px;
		height: 0;
		border: dashed 3px rgba(0, 0, 0, .7);
	}
</style>

<script>
	import { io } from "socket.io-client";
	import Bar from "$lib/Bar.svelte";

</script>

<div class="div-container">
	<div class="game-container">
		<div class="bar-container above">
			<Bar />
		</div>
		<div class="bar-container below">
			<Bar />
		</div>
	</div>

	<div class="central-line"></div>

</div>

