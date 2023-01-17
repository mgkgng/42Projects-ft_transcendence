<style lang="scss">
	.result {
		width: 22em;
		height: 28em;
		align-items: center;
		justify-content: space-around;

		.msg {
			h3 { font-size: 23px; }
			align-items: center;
			img {
				width: 150px;
				height: 150px;
				object-fit: cover;
				border-radius: .3em;
			}
		}
		button {
			width: 5em;
			height: 4em;
			cursor: pointer;
			color: #fff;
			transition: .2s;
			border: $border-thin;
			border-radius: .3em;

			&:nth-child(1):hover { background-color: $main-bright; }
			&:nth-child(2):hover { background-color: $submain-blue; }
		}
	}
</style>

<script lang="ts">
	export let winner: any;
	export let gameModal: any;
	export let itself: any;
	export let scores: Array<number>;

	if (scores[0] > scores[1]) { // my brain is paralysed for now...
		let tmp = scores[0];
		scores[0] = scores[1];
		scores[1] = tmp;
	}
</script>

<div class="vflex window result">
	<div class="vflex msg">
		<h2>THE WINNER IS ...</h2>
		<h3>{winner.info.username}!</h3>
		<img src="{winner.info.img_url}" alt="winner" />
		<div class="flex score">
			<h1>{(scores[0] > scores[1]) ? scores[0]: scores[1]} : {(scores[0] > scores[1]) ? scores[1]: scores[0]}</h1>
		</div>
	</div>
	<button on:click={() => { gameModal.close(); }}>Home</button>
</div>