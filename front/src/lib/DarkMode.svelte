<style lang="scss">
	.color-change-circle {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 30px;
		aspect-ratio: 1 / 1;
		border-radius: 20%;

		background-color: #e6e6e6;
		cursor: pointer;

		animation-name: size-change;
		animation-duration: 3.5s;
		animation-iteration-count: infinite;
		animation-timing-function: linear;

		overflow: hidden; // doesn't work yet
	}
</style>

<script lang="ts">
	import { darkMode } from "$lib/stores/var";

	let dark: boolean;

	darkMode.subscribe(value => {
		dark = value;
	});

</script>

<div class="color-change-circle" on:click={() => {
	darkMode.update(darkMode => !darkMode);
}}
style="{(dark) ? "background-color: rgba(255, 255, 255, .9)" : "background-color: rgba(0, 0, 0, .9)"}"></div>
