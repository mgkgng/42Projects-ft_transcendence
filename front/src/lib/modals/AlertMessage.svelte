<style lang="scss">
	.message {
		width: 350px;
		height: 200px;
		padding-top: 2.8em;

		h3 {
			font-size: 22px;
		}

		align-items: center;
		justify-content: space-around;

		button {
			width: 5em;
			height: 5em;
			transition: .4s;
			border: $border;
			border-radius: .3em;
			cursor: pointer;
			&:hover { background-color: $red; }
		}
	}
</style>

<script lang="ts">
	export let itself: any;
	export let msg: string;

</script>

<div class="vflex window message">
	<h3>{msg}</h3>
	<button on:click={()=>{ itself.close(); }}>Close</button>
</div>