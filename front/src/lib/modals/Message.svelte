<style lang="scss">
	.message {
		width: 500px;
		height: 200px;
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

	$:console.log("coucou, le modal est ouvert!");
</script>

<div class="vflex window message">
	<h2>{msg}</h2>
	<button on:click={()=>{ itself.close(); }}>Close</button>
</div>