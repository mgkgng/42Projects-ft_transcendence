<style lang="scss">
	.nav-bar {
		display: grid;
		height: 100%;
		grid-template-rows: 50% 5%;
		padding: 0 2em;
		z-index: 3;
	}

	.menus {
		// z-index: 3;
		display: flex;
		flex-direction: row;
		height: 100%;
		//align-items: center;
		justify-content: center;
		gap: 2em;
		// padding: 0 5em;

		.menu {
			font-size: 28px;
			letter-spacing: .75px;
			color: var(--col);
			opacity: .2;
			transition: .4s;
			user-select: none;
		}

		.menu:hover {
			transform: translateY(-15px);
			opacity: .9;
		}
	}

	.button {
		width: 100px;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		background-color: #fff;
	}
</style>

<script lang="ts">
    import LightBar from "./LightBar.svelte";
	import { darkMode } from "$lib/stores/var";

	let dark : boolean;

	darkMode.subscribe(value => {
		dark = value;
	});

	import '$lib/scss/app.scss';

	$: col = (dark) ? "#fff" : "#000"
</script>


<div class="nav-bar">
	<div class="menus" style="--col: {col}">
		<div class="menu">About</div>
		<div class="menu">Rooms</div>
		<div class="menu">Menu3</div>
		<div class="menu">Menu4</div>
	</div>
	<LightBar />
</div>