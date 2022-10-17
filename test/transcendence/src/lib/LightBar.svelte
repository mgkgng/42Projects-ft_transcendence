<style lang="scss">
	.light-bar {
		position: relative;
		left: 500px;
		width: 150px;
		height: 0px;
		border-radius: 5rem;
		border: none;
		background-color: #fff;
		box-shadow: 0px 0 10px 40px transparentize($main2, 0.4);
		translate: .5s;
	}

	.test {
		position: relative;
		left: 520px;
		background-color: transparentize($main, .5);
		width: 100px;
		height: 20px;
		border-radius: 5rem;
		box-shadow: 0px 0 10px 20px transparentize($main, 0.4);

		border: none;
	}
</style>

<script>
	let posX = 800;
</script>

<div class="light-bar" style="--posX: {posX}px"></div>
<!-- <div class="test"></div> -->

<svelte:window on:mousemove={ (e)=> {
	if (e.screenY < 800)
		return ;
	posX = e.screenX - 100;
	if (posX < 550)
		posX = 550;
	if (posX > 1150)
		posX = 1150;
}}/>
