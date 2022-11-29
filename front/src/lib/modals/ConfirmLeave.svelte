<style lang="scss">
	.confirm {
		width: 250px;
		height: 200px;

		p {
			text-align: center;
		}

		.buttons {
			gap: 0.2em;
			justify-content: center;
			button {
				width: 4.5em;
				height: 3em;
				border: $border;
				border-radius: .3em;
				background-color: $red;

				&:first-child { background-color: $green; }
				&:hover { filter: brightness(80%); }
			}
		}
	}
</style>

<script lang="ts">
	export let itself: any;
	export let settingModal: any;
</script>

<div class="vflex window confirm">
	<p>Are you sure? You will lose your changes if you don't save it.</p>
	<div class="flex buttons">
		<button on:click={() => { itself.close(); }}>Cancel</button>
		<button on:click={() => { settingModal.close(); }}>Confirm</button>
	</div>
</div>