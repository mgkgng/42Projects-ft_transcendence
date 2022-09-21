<style lang="scss">
	.light-bar {
		position: relative;
		left: var(--posX);
		width: 150px;
		height: 10px;
		border-radius: 5rem;
		background-color: rgba(0, 255, 255, 0.2);
		box-shadow: 0px -40px 80px 40px transparentize($main, 0.4);
		translate: .5s;
	}
</style>

<script>
	let posX = 800;
</script>

<div class="light-bar" style="--posX: {posX}px"></div>

<svelte:window on:mousemove={ (e)=> {
	if (e.screenY < 800)
		return ;
	posX = e.screenX - 100;
	if (posX < 550)
		posX = 550;
	if (posX > 1150)
		posX = 1150;
}}/>
