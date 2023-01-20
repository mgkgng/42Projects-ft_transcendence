<style lang="scss">
	.invitation {

	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';

	export let msg: string;

	onMount(() => {

	});
</script>

<div class="window invitation">
	<p></p>
	<div>
		<button on:click={() => {
			
		}}>Join</button>
		<button>Close</button>
	</div>
</div>