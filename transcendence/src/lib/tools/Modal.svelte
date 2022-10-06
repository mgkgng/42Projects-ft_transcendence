<script>
	import Portal from "./Portal.svelte";

	export let cssClass = "card";
	export let closeOnBgClick = true;

	let state = false;


	export function toggle(_state = !state)
	{ state = _state; }

	export function open()
	{ toggle(true); }
	export function close()
	{ toggle(false); }

	function handleBgClick() {
    	if (closeOnBgClick)
      		close();
    }
</script>

<style lang="scss">
	.card {
		width: 100%;
		max-width: 30rem;
		max-height: 100vh;
		overflow: auto;
		/*padding: 2rem;*/
		gap: 2rem;
		background: transparentize($card, .05);
	}
	.backdrop {
		position: fixed;
		display: grid;
		place-items: center;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: #0005;
		z-index: 99999;
	}
</style>

{#if state}
	<Portal>
		<div class="backdrop" tabindex="-1" on:click={handleBgClick}>
			<div class={cssClass} on:click={e => {
                e.stopPropagation();
            }}>
				<slot />
			</div>
		</div>
	</Portal>
{/if}