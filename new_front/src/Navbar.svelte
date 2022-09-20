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
		font-family: "Modernism";
		//align-items: center;
		justify-content: center;
		gap: 2em;
		// padding: 0 5em;

		.menu {
			font-size: 28px;
			letter-spacing: .2rem;
			color: rgba(255, 255, 255, 0.9);
			transition: .4s;
			user-select: none;
		}

		.menu:hover {
			transform: translateY(-15px);
		}
	}
</style>

<script>
    import LightBar from "./LightBar.svelte";

</script>


<div class="nav-bar">
	<div class="menus">
		<div class="menu">Menu1</div>
		<div class="menu">Menu2</div>
		<div class="menu">About</div>
		<div class="menu">Menu3</div>
		<div class="menu">Menu4</div>
	</div>
	<LightBar />
</div>