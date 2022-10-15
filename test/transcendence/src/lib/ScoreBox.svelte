<style lang="scss">
	.score-box {
		display: flex;
		flex-direction: row;

		color: #fff;
		font-size: 128px;

		border: 2px dashed #fff;
		border-left: 0;

		max-width: 150px;
		
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

