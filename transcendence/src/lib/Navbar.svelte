<style lang="scss">
	.nav-bar {
		display: grid;
		height: 100%;
		grid-template-rows: 50% 5%;
		padding: 0 2em;
	}

	.menus {
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
</style>

<script>
	import { darkMode } from "$lib/stores/store";
    import LightBar from "./LightBar.svelte";
	import '$lib/scss/app.scss';

	$: col = (darkMode) ? "#fff" : "#222222"
</script>


<div class="nav-bar">
	<div class="menus" style="--col: {col}">
		<div class="menu">Menu1</div>
		<div class="menu">Menu2</div>
		<div class="menu">About</div>
		<div class="menu">Menu3</div>
		<div class="menu">Menu4</div>
	</div>
	<!-- <LightBar /> -->
</div>