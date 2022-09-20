<style lang="scss">
	.nav-bar {
		// color: rgba(0, 0, 0, 0);
		display: grid;
		height: 100%;
		grid-template-columns: repeat(5, auto);
		font-family: "Modernism";
		// padding: 0 5em;

		.menu {
			font-size: 28px;
			letter-spacing: .2rem;
			color: white;
			transition: .4s;
		}

		.menu:hover {
			transform: translateY(-15px);
		}
	}
</style>

<script>

</script>


<div class="nav-bar">
	<div class="menu">Menu1</div>
	<div class="menu">Menu2</div>
	<div class="menu">About</div>
	<div class="menu">Menu3</div>
	<div class="menu">Menu4</div>
</div>