<style lang="scss">
	.container {
		display: flex;
		flex-direction: row;
		gap: 3em;
	}
	.button {
		width: 140px;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		overflow: hidden;
		cursor: pointer;
		color: #e6e6e6;
		background-color: transparentize(#fff, 0.9);
		backdrop-filter: blur(6px);
		border: 2px solid;
		text-align: center;
		font-size: 25px;
		display: flex;
		justify-content: center;
		align-items: center;

		transition: transform .2s;

		&:hover {
			transform: translateY(-10px);
		}
	}
</style>

<script>
	
</script>

<div class="container">
	<div class="button">Join Room</div>
	<div class="button">Create Game</div>
	<div class="button">Random Match</div>
</div>