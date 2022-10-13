<style lang="scss">
	.score-box {
		display: flex;
		flex-direction: row;

		color: #fff;
		font-size: 128px;

		border: 5px dashed #fff;

		width: 3em;
		height: 5em;

		align-items: center;
		justify-content: center;
	}
</style>

<script lang="ts">
	export let score: number;
</script>

<div class="score-box">
	<div class="score">{score}</div>
</div>

