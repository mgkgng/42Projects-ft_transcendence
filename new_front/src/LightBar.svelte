<style lang="scss">
	.light-bar {
		position: relative;
		left: var(--posX);
		width: 150px;
		height: 10px;
		border-radius: 5rem;
		background-color: rgba(255, 255, 255, 0.8);
		box-shadow: 0px -40px 80px 40px rgba(139, 226, 226, 0.8);
		translate: .5s;
	}

	// .content::after {
	// 	content: '';
		
	// }
</style>

<script>
	let posX = 800;
</script>

<div class="light-bar" style="--posX: {posX}px"></div>

<svelte:window on:mousemove={ (e)=> {
	posX = e.screenX - 100;
	if (posX < 550)
		posX = 550;
	if (posX > 1150)
		posX = 1150;
}}/>
