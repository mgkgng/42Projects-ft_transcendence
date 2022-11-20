<style lang="scss">
	.setting {
		width: 440px;
		height: 520px;

		justify-content: space-between;

		padding: 2em;

		color: #fff;

		button {
			font-size: 22px;
			background-color: #212121;
			padding: .7em;
			border: 2px solid transparentize(#fff, .4);
			border-radius: .3em;
			transition: .2s;
			cursor: pointer;

			&:hover {
				filter:brightness(80%);
				transform: scale(1.02);
			}
		}
	}
</style>

<script lang="ts">
	export let itself: any;
</script>

<div class="vflex window setting">
	<h2>Setting here</h2>
	<button on:click={()=>{itself.close();}}>Close</button>
</div>