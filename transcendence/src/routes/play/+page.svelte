<style lang="scss">
	main {
		height: 100vh;
	}

	.container {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.game-container {
		width: 720px;
		height: 800px;
		padding: 0;
		border: solid transparentize(#000, .3);
		border-radius: 1em;
		display: grid;
		grid-template-rows: 2% 3% 90% 3% 2%;
	}

	.bar-container-above {
		position: relative;
		display: flex;
		align-items: center;
	}

	.bar-container-below {
		position: relative;
		display: flex;
		align-items: center;
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

<main>
	<div class="container">
		<div class="game-container">
			<div></div>
			<div class="bar-container-above">
				<Bar />
			</div>
			<div></div>
			<div class="bar-container-below">
				<Bar />
			</div>
			<div></div>
		</div>
		<div class="central-line"></div>
	</div>
</main>

