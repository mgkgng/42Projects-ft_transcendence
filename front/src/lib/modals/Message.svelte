<style lang="scss">
	.message {
		button {
			width: 4em;
			height: 2.5em;
			transition: .3s;
			&:hover { background-color: $main-dark; }
		}
	}
</style>

<script lang="ts">
	export let itself: any;
	export let msg: string;
</script>

<div class="vflex window message">
	<h2>{msg}</h2>
	<button>Close</button>
</div>