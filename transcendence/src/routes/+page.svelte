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
	import Title from "$lib/Title.svelte";
	import Navbar from "$lib/Navbar.svelte";
</script>

<main>
	<div>
		<Title topMargin={180} leftMargin={700} />
	</div>
	<Navbar />
</main>

