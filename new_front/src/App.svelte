<style lang="scss">
	main {
		display: grid;
		height: 100vh;
		grid-template-rows: 90vh 10vh;
		gap: 0;
		padding: 0;
	}

</style>

<script lang="ts">
	import Title from "./Title.svelte";
	import Navbar from "./Navbar.svelte";
</script>

<main>
	<div>
		<Title topMargin={150} leftMargin={450} />
	</div>
	<Navbar />
</main>

