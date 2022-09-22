<style lang="scss">
	.side-circle {
		position: absolute;
		top: var(--top);
		left: var(--left);
		width: var(--size);
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		background-color: #000;
		box-shadow: 0px 0px 60px 2px $main;
		transition: 8s;
	}

	.side-circle:hover {
		transform-origin: center;

		width: 60px;
	}
</style>

<script>

</script>

<div class="side-circle" style="--top: 20px; --left: 30px; --size: 120px"></div>