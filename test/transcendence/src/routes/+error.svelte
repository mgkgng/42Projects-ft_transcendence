<style>
	.container {
		max-height: 100%;
		background-color: rgba(0, 0, 0, 0);
		display: grid;
		grid-template-rows: 90vh 10vh;
		gap: 0;
		padding: 0;
	}

	@keyframes size-change {
		0% { transform: scale(1) }
		50% { transform: scale(1.3) }
		100% { transform: scale(1) }
	}
</style>

<script>
	import DarkMode from "$lib/DarkMode.svelte";
    import Navbar from "$lib/Navbar.svelte";
    import Title from "$lib/Title.svelte";
</script>


<div class="container">
	<DarkMode/>
	<Title title={"Error 404"} mainPage={false}/>
	<Navbar />
</div>