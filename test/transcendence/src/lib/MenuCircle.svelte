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

		right: 0;
		top: 0;

		width: 50px;
		height: 50px;
		border-radius: 20%;

		z-index: 9998;

		background-color: rgb(163, 219, 229);
		box-shadow: 0px 0px 5px 20px rgb(49, 211, 240); //maybe?
		box-shadow: 0px 0px 40px 10px $main; //maybe?
		transform-origin: right;

		animation-name: size-change;
		animation-duration: 3.5s;
		animation-iteration-count: infinite;
		animation-timing-function: linear;

		cursor: pointer;

		// transition: left 2s;

		// overflow: hidden; // doesn't work yet

		
		&::before {
			content: "";

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

	.menu {
		// display: none;
		position: absolute;
		right: 0;


		width: 50px;
		height: 50px;

		background-color: rgb(163, 219, 229);

		transition: .7s;

	}

	.expanded {
		display: flex;
		flex-direction: rows;
		border-radius: .8em;
		z-index: 9999;
		top: 0;
		width: 50%;
		height: 10%;
		animation: none;
	}

	.button {
		width: 10%;
		cursor: pointer;
	}

</style>

<script lang="ts">
    import CreateGame from "./CreateGame.svelte";
import Modal from "./tools/Modal.svelte";

	let expanded = false;
	let createGameModal: any;

	$: console.log(expanded);
</script>

<button class="menu-circle"
	on:click={() => { expanded = true; }}>
</button>
<div class="menu {expanded && "expanded"}">
	<button class="button">hello</button>
	<button class="button">Rooms</button>
	<button class="button" on:click={() => {
		createGameModal.open();
	}}>Create</button>
	<button class="button" on:click={() => { expanded = false; }}>X</button>
</div>

<Modal bind:this={createGameModal} closeOnBgClick={true}>
	<CreateGame />
</Modal>