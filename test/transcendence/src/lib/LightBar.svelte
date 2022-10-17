<style lang="scss">
	.light-bar {

		position: absolute;
		z-index: 1;
		left: 500px;
		width: 150px;
		height: 20px;
		border-radius: 5em;
		border: none;
		background-color: transparentize($main2, .4);
		box-shadow: 0px 0 10px 10px transparentize($main2, 0.4);
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
