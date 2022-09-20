<style lang="scss">
	.light-bar {
		// position: absolute;
		// left: var(--posX);
		width: 150px;
		height: 10px;
		border-radius: 5rem;
		background-color: rgba(255, 255, 255, 0.9);
		box-shadow: 0px -40px 80px 40px rgba(139, 226, 226, 0.8);
		translate: .5s;
	}

	// .content::after {
	// 	content: '';
		
	// }
</style>

<script>
	let posX = 150;
</script>

<div class="light-bar" style="--posX: {posX}px"></div>

<svelte:window on:keypress={ (e)=> {
	if (e.code == "KeyD" && posX < 600)
		posX += 5;
	else if (e.code == "KeyA" && posX > 0)
		posX -= 5;
}}/>
