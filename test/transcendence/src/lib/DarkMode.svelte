<style lang="scss">
	@keyframes size-change {
		0% { transform: scale(1) }
		50% { transform: scale(1.2) }
		100% { transform: scale(1) }
	}

	.color-change-circle {
		position: absolute;
		bottom: -40px;
		left: -40px;
		width: 80px;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		// box-shadow: 0px 0px 50px 10px #000;
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
