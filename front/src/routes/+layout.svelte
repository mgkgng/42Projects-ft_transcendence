<style lang="scss">
	main {
		padding: 0;
		width: 100vw;
		height: 100vh;
		overflow: hidden;

		background-color: #000;
	}
</style>

<script lang="ts">
	import '$lib/scss/app.scss';
</script>

<main>
	<slot />
</main>