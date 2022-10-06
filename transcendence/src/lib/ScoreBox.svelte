<style lang="scss">
	.score-box {
		display: flex;
		flex-direction: row;
	}
</style>

<script lang="ts">
	export let score: number;
</script>

<div class="score-box">
	<div class="score">{score}</div>
</div>

