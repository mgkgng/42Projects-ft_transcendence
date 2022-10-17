<style lang="scss">

	@keyframes size-change {
		0% { transform: scale(1) }
		50% { transform: scale(1.2) }
		100% { transform: scale(1) }
	}

	.menu-circle {
		position: absolute;

		left: 97%;
		top: -5%;

		width: 6%;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		
		background-color: rgb(163, 219, 229);
		box-shadow: 0px 0px 5px 20px rgb(49, 211, 240); //maybe?
		box-shadow: 0px 0px 40px 40px $main; //maybe?

		animation-name: size-change;
		animation-duration: 3.5s;
		animation-iteration-count: infinite;
		animation-timing-function: linear;

		overflow: hidden; // doesn't work yet
	}
</style>

<script lang="ts">

</script>

<div class="menu-circle">

</div>