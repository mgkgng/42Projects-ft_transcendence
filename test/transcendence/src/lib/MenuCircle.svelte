<style lang="scss">

	@keyframes size-change {
		0% { transform: scale(1) }
		50% { transform: scale(1.2) }
		100% { transform: scale(1) }
	}

	@keyframes grow {
		0% {
			transform: scaleY(0);
			opacity: 0;
		}
		to {
			transform: scaleY(1);
			opacity: 1;
		}
	}

	.menu-circle {
		position: absolute;

		left: 95%;
		top: -5%;

		width: 10%;
		aspect-ratio: 1 / 1;
		border-radius: 50%;

		background-color: rgb(163, 219, 229);
		box-shadow: 0px 0px 5px 20px rgb(49, 211, 240); //maybe?
		box-shadow: 0px 0px 40px 10px $main; //maybe?		
		animation-name: size-change;
		animation-duration: 3.5s;
		animation-iteration-count: infinite;
		animation-timing-function: linear;

		cursor: pointer;

		transition: .5s;

		// overflow: hidden; // doesn't work yet

		&:hover {
			border-radius: .8em;
			top: 0;
			width: 50%;
			height: 10%;
			left: 50%;
			animation: none;
		}

		&::before {
			content: "";

			z-index: 9999;
			transform-origin: top;
			cursor: pointer;
		}

		button {
			width: 100%;
			padding: 1em 1.5em;
			cursor: pointer;
			display: flex;
			align-items: center;
			gap: 10px;

			img {
				height: 1.5em;
			}
		}
	}

	.menu:focus-within {
		background-color: red;
		// animation: grow .1s ease-in-out;
	}

</style>

<!-- .menu {
	display: none;
	position: absolute;
	right: 0;
	background: $background;
	border: 2px solid $border;
	border-radius: $border-radius;
	z-index: 9999;
	transform-origin: top;

	&::before {
		content: "";
		top: -16px;
		right: 9px;
		left: auto;
		border: 8px solid transparent;
		border-bottom-color: transparent;
		border-bottom-color: $border;
		position: absolute;
		display: inline-block;
	}

	button {
		width: 100%;
		padding: 1em 1.5em;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 10px;

		img {
			height: 1.5em;
		}
	}
} -->

<script lang="ts">

</script>

<div class="menu-circle">
	<button>hello</button>
</div>