<style lang="scss">
	.score-box {
		width: 100%;
		height: 5em;
		position: absolute;

		top: 30%;
	}
	.score {
		width: 1.5em;
		height: 100%;

		color: #fff;
		font-size: 65px;
		text-align: center;
	}

	.right {
		float: right;
	} 
</style>

<script lang="ts">
	export let score1: any, score2: any;
</script>

<div class="score-box">
	<div class="score">{score1}</div>
	<div class="score right">{score2}</div>
</div>
