<style lang="scss">
	.color-change-circle {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 40px;
		aspect-ratio: 1 / 1;
		border-radius: 20%;
		cursor: pointer;

		transition: .2s;

		&:hover { opacity: 0.2; }
	}
</style>

<script lang="ts">
	import { darkMode } from "$lib/stores/var";

	let dark: boolean;
	darkMode.subscribe(value => { dark = value; });

</script>

<div class="color-change-circle" on:click={() => {
	darkMode.update(darkMode => !darkMode);
}}
style="{(dark) ? "background-color: rgba(255, 255, 255, .9)" : "background-color: rgba(0, 0, 0, .9)"}"></div>
