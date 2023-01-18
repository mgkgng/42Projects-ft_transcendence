<style lang="scss">
	.puck, .shadow {
		position: absolute;
		margin: 0;

		z-index: 1;
		width: 15px;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		background-color: #fff;
	}

	.puck {
		box-shadow: 0px 0px 5px 3px $yellow;
	}

	.shadow {
		opacity: var(--opacity);
	}
</style>

<script lang="ts">
	export let pucks: Array<any>;
</script>

{#if pucks.length > 3}
<div class="shadow"
	style="top: {pucks[3][0]}px; left: {pucks[3][1]}px; --opacity: 15%">
</div>
{/if}
{#if pucks.length > 2}
<div class="shadow"
	style="top: {pucks[2][0]}px; left: {pucks[2][1]}px; --opacity: 30%">
</div>
{/if}
{#if pucks.length > 1}
<div class="shadow"
	style="top: {pucks[1][0]}px; left: {pucks[1][1]}px; --opacity: 60%">
</div>
{/if}
{#if pucks.length}
<div class="puck"
	style="top: {pucks[0][0]}px; left: {pucks[0][1]}px;">
</div>
{/if}