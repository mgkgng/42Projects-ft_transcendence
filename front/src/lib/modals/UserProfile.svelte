<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		gap: 0;
		margin: 0;
		width: 550px;
		background-color: transparentize(#000, 0.2);
		padding: 2em;
		border-radius: 2em;
	}
	
	.photo-zone {
		width: 100%;
		min-height: 200px;

		img {
			width: 100%;
		}
	}

	.tool-zone {
		width: 100%;
		height: 80px;
		border-radius: .2em;
		margin-top: .2em;
		margin-bottom: 1em;
		padding: 1em;
		
		border: 2px solid transparentize(#fff, .6);
		background-color: transparentize(#fff, .9);
		color: #e6e6e6;

		display: flex;
		flex-direction: row;
		gap: .5em;

		button {
			width: 5em;
			aspect-ratio: 1 / 1;
			border-radius: 1em;
			border: 2px solid transparentize(#fff, .6);
			cursor: pointer;
			transition: .2s;

			&:hover {
				transform: scale(1.05);
			}
		}
	}

	.info-zone {
		width: 100%;
		max-height: 60px;
		border-radius: 1em;
	}

	.history-zone {
		width: 100%;
		min-height: 200px;
	}
</style>

<script lang="ts">
	// export let userInfo;
</script>

<div class="container">
	<div class="photo-zone">
		<img src="/pingu/pingu-angry.jpeg" alt="pingu-angry">
	</div>
	<div class="tool-zone">
		<button>add</button>
		<button>block</button>
		<button>message</button>
	</div>
	<div class="info-zone">
		info here
	</div>
	<div class="history-zone">
		history here
	</div>
</div>